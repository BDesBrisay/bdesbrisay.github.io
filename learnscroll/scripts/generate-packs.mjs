import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifestEntryFromPack } from '../content/src/builders.mjs';
import { packRegistry } from '../content/src/registry.mjs';

const writeJson = async (target, value) => {
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const assertUniquePackIds = (registryEntries) => {
  const seen = new Set();

  for (const entry of registryEntries) {
    if (seen.has(entry.packId)) {
      throw new Error(`Duplicate pack id in registry: ${entry.packId}`);
    }
    seen.add(entry.packId);
  }
};

const assertUniqueCardIdsAcrossPacks = (packs) => {
  const seen = new Map();

  for (const pack of packs) {
    for (const card of pack.cards) {
      const existingPackId = seen.get(card.id);
      if (existingPackId) {
        throw new Error(
          `Duplicate card id across packs: ${card.id} appears in ${existingPackId} and ${pack.packId}`
        );
      }
      seen.set(card.id, pack.packId);
    }
  }
};

const assertPackIdMapping = (registryEntries, generatedPacks) => {
  for (let index = 0; index < registryEntries.length; index += 1) {
    const registryEntry = registryEntries[index];
    const generatedPack = generatedPacks[index];

    if (!generatedPack) {
      throw new Error(`Missing generated pack for registry entry ${registryEntry.packId}`);
    }

    if (registryEntry.packId !== generatedPack.packId) {
      throw new Error(
        `Registry order mismatch: expected ${registryEntry.packId} but got ${generatedPack.packId}`
      );
    }
  }
};

const assertManifestUrlsResolve = (manifest, generatedPacks) => {
  const generatedPaths = new Set(generatedPacks.map((pack) => `/content/packs/${pack.packId}.json`));

  for (const entry of manifest.packs) {
    if (!generatedPaths.has(entry.url)) {
      throw new Error(`Manifest url does not map to generated pack file: ${entry.url}`);
    }
  }
};

const assertPrerequisitesValid = (generatedPacks) => {
  const packIdSet = new Set(generatedPacks.map((pack) => pack.packId));

  for (const pack of generatedPacks) {
    const prerequisites = pack.prerequisites ?? [];

    for (const prerequisite of prerequisites) {
      if (prerequisite === pack.packId) {
        throw new Error(`Pack ${pack.packId} cannot reference itself as a prerequisite.`);
      }

      if (!packIdSet.has(prerequisite)) {
        throw new Error(`Pack ${pack.packId} references unknown prerequisite ${prerequisite}.`);
      }
    }
  }
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const rootContentDir = resolve(rootDir, 'content');
const appContentDir = resolve(rootDir, 'app/public/content');

const generatedAt = new Date().toISOString();

assertUniquePackIds(packRegistry);

const generatedPacks = packRegistry.map((entry) => entry.buildPack({ createdAt: generatedAt }));

assertPackIdMapping(packRegistry, generatedPacks);
assertUniqueCardIdsAcrossPacks(generatedPacks);
assertPrerequisitesValid(generatedPacks);

const manifest = {
  generatedAt,
  packs: generatedPacks.map((pack, index) => manifestEntryFromPack(pack, packRegistry[index].defaultInstall))
};

assertManifestUrlsResolve(manifest, generatedPacks);

await mkdir(resolve(rootContentDir, 'packs'), { recursive: true });
await mkdir(resolve(appContentDir, 'packs'), { recursive: true });

const writes = [
  writeJson(resolve(rootContentDir, 'manifest.json'), manifest),
  writeJson(resolve(appContentDir, 'manifest.json'), manifest)
];

for (const pack of generatedPacks) {
  writes.push(writeJson(resolve(rootContentDir, `packs/${pack.packId}.json`), pack));
  writes.push(writeJson(resolve(appContentDir, `packs/${pack.packId}.json`), pack));
}

await Promise.all(writes);

const cardCount = generatedPacks.reduce((sum, pack) => sum + pack.cards.length, 0);
console.log(`Generated ${generatedPacks.length} packs and ${cardCount} cards.`);
