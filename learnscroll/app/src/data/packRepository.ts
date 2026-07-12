import { db } from './db';
import { parseContentPack, parsePackManifest } from './packSchemas';
import { compareVersions } from '../lib/version';
import type {
  ContentPackData,
  CurriculumDomain,
  InstalledPack,
  PackManifest,
  PackManifestEntry
} from '../types/domain';

const nowIso = (): string => {
  return new Date().toISOString();
};

const parseJson = (text: string): object => {
  return JSON.parse(text) as object;
};

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.text();
};

export const fetchManifest = async (): Promise<PackManifest> => {
  const text = await fetchText('/content/manifest.json');
  const parsed = parseJson(text);
  return parsePackManifest(parsed);
};

export const fetchPackData = async (url: string): Promise<ContentPackData> => {
  const text = await fetchText(url);
  const parsed = parseJson(text);
  return parseContentPack(parsed);
};

const toInstalledPack = (pack: ContentPackData, sourceUrl: string): InstalledPack => {
  return {
    id: pack.packId,
    version: pack.version,
    title: pack.title,
    topics: pack.topics,
    installedAt: nowIso(),
    sourceUrl,
    domain: pack.domain,
    track: pack.track,
    stage: pack.stage,
    recommendedOrder: pack.recommendedOrder,
    prerequisites: pack.prerequisites
  };
};

export const installPack = async (
  entry: Pick<PackManifestEntry, 'url'>,
  force: boolean
): Promise<{ installed: boolean; packId: string; version: string }> => {
  const pack = await fetchPackData(entry.url);
  const existing = await db.contentPacks.get(pack.packId);

  if (existing && !force && compareVersions(existing.version, pack.version) >= 0) {
    return {
      installed: false,
      packId: existing.id,
      version: existing.version
    };
  }

  await db.transaction('rw', db.contentPacks, db.cards, async () => {
    await db.cards.where('packId').equals(pack.packId).delete();
    await db.cards.bulkPut(pack.cards);
    await db.contentPacks.put(toInstalledPack(pack, entry.url));
  });

  return {
    installed: true,
    packId: pack.packId,
    version: pack.version
  };
};

export const installDefaultPacksFromManifest = async (): Promise<number> => {
  const manifest = await fetchManifest();
  const defaultPacks = manifest.packs.filter((pack) => pack.defaultInstall);

  let installedCount = 0;
  for (const entry of defaultPacks) {
    const result = await installPack(entry, false);
    if (result.installed) {
      installedCount += 1;
    }
  }

  return installedCount;
};

export const migrateLegacyStarterInstalls = async (): Promise<number> => {
  const manifest = await fetchManifest();
  const installed = await getInstalledPacks();
  const installedSet = new Set(installed.map((pack) => pack.id));
  const manifestById = new Map(manifest.packs.map((pack) => [pack.packId, pack]));

  const migrationPairs: Array<{ legacy: string; replacement: string }> = [
    { legacy: 'starter-math-v1', replacement: 'math-arithmetic-v1' },
    { legacy: 'starter-science-v1', replacement: 'science-physics-v1' }
  ];

  let installedCount = 0;

  for (const pair of migrationPairs) {
    if (!installedSet.has(pair.legacy) || installedSet.has(pair.replacement)) {
      continue;
    }

    const entry = manifestById.get(pair.replacement);
    if (!entry) {
      continue;
    }

    const result = await installPack(entry, false);
    if (result.installed) {
      installedCount += 1;
      installedSet.add(pair.replacement);
    }
  }

  return installedCount;
};

const sortByRecommendedOrder = (left: PackManifestEntry, right: PackManifestEntry): number => {
  const leftOrder = left.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.packId.localeCompare(right.packId);
};

export const findDomainStarterBundle = (
  manifest: PackManifest,
  domain: CurriculumDomain
): PackManifestEntry[] => {
  const domainPacks = manifest.packs
    .filter((pack) => pack.domain === domain)
    .sort(sortByRecommendedOrder);

  if (domainPacks.length === 0) {
    return [];
  }

  const foundationPacks = domainPacks.filter((pack) => pack.stage === 'foundation');
  if (foundationPacks.length > 0) {
    return [foundationPacks[0]];
  }

  return [domainPacks[0]];
};

export const installDomainStarterBundle = async (
  domain: CurriculumDomain
): Promise<{ installedCount: number; packIds: string[] }> => {
  const manifest = await fetchManifest();
  const starterEntries = findDomainStarterBundle(manifest, domain);

  let installedCount = 0;
  const packIds: string[] = [];

  for (const entry of starterEntries) {
    const result = await installPack(entry, false);
    packIds.push(entry.packId);
    if (result.installed) {
      installedCount += 1;
    }
  }

  return { installedCount, packIds };
};

export const getInstalledPacks = async (): Promise<InstalledPack[]> => {
  return db.contentPacks.orderBy('id').toArray();
};

export interface PackUpdateInfo {
  packId: string;
  title: string;
  currentVersion: string;
  latestVersion: string;
  url: string;
}

export const checkForPackUpdates = async (): Promise<PackUpdateInfo[]> => {
  const manifest = await fetchManifest();
  const installed = await getInstalledPacks();
  const installedById = new Map(installed.map((pack) => [pack.id, pack]));

  const updates: PackUpdateInfo[] = [];

  for (const entry of manifest.packs) {
    const current = installedById.get(entry.packId);
    if (!current) {
      continue;
    }

    if (compareVersions(current.version, entry.version) < 0) {
      updates.push({
        packId: entry.packId,
        title: entry.title,
        currentVersion: current.version,
        latestVersion: entry.version,
        url: entry.url
      });
    }
  }

  updates.sort((left, right) => left.packId.localeCompare(right.packId));
  return updates;
};
