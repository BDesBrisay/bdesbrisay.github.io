import { useEffect, useMemo, useState } from 'react';
import {
  checkForPackUpdates,
  fetchManifest,
  getInstalledPacks,
  installDomainStarterBundle,
  installPack,
  type PackUpdateInfo
} from '../../data/packRepository';
import { useSessionStore } from '../../store/sessionStore';
import type {
  CurriculumDomain,
  InstalledPack,
  PackManifestEntry
} from '../../types/domain';

const domainLabel = (domain: CurriculumDomain): string => {
  if (domain === 'computer-science') {
    return 'Computer Science';
  }
  return domain.charAt(0).toUpperCase() + domain.slice(1);
};

const trackLabel = (track: string): string => {
  return track
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const sortPackEntries = (left: PackManifestEntry, right: PackManifestEntry): number => {
  const leftOrder = left.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.packId.localeCompare(right.packId);
};

export const PacksPage = () => {
  const [installed, setInstalled] = useState<InstalledPack[]>([]);
  const [manifestPacks, setManifestPacks] = useState<PackManifestEntry[]>([]);
  const [updates, setUpdates] = useState<PackUpdateInfo[]>([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const { activePackIds, setActivePackFocus, startSession } = useSessionStore();

  const loadData = async (): Promise<void> => {
    const [installedPacks, manifest] = await Promise.all([getInstalledPacks(), fetchManifest()]);
    setInstalled(installedPacks);
    setManifestPacks(manifest.packs.sort(sortPackEntries));
  };

  useEffect(() => {
    void loadData();
  }, []);

  const installedById = new Map(installed.map((pack) => [pack.id, pack]));
  const installedIdSet = new Set(installed.map((pack) => pack.id));

  const domains = useMemo<CurriculumDomain[]>(() => {
    const values = manifestPacks
      .map((pack) => pack.domain)
      .filter((domain): domain is CurriculumDomain => Boolean(domain));
    return [...new Set(values)].sort((left, right) => left.localeCompare(right));
  }, [manifestPacks]);

  const groupedByDomainAndTrack = useMemo(() => {
    const grouped = new Map<CurriculumDomain, Map<string, PackManifestEntry[]>>();

    for (const pack of manifestPacks) {
      if (!pack.domain || !pack.track) {
        continue;
      }

      const byTrack = grouped.get(pack.domain) ?? new Map<string, PackManifestEntry[]>();
      const trackGroup = byTrack.get(pack.track) ?? [];
      trackGroup.push(pack);
      byTrack.set(pack.track, trackGroup);
      grouped.set(pack.domain, byTrack);
    }

    return grouped;
  }, [manifestPacks]);

  const domainProgress = useMemo(() => {
    const progress = new Map<CurriculumDomain, { installed: number; total: number }>();

    for (const domain of domains) {
      const domainPacks = manifestPacks.filter((pack) => pack.domain === domain);
      const installedCount = domainPacks.filter((pack) => installedIdSet.has(pack.packId)).length;
      progress.set(domain, {
        installed: installedCount,
        total: domainPacks.length
      });
    }

    return progress;
  }, [domains, installedIdSet, manifestPacks]);

  const togglePackFocus = async (packId: string): Promise<void> => {
    const next = activePackIds.includes(packId)
      ? activePackIds.filter((id) => id !== packId)
      : [...activePackIds, packId];
    await setActivePackFocus(next);
    await startSession();
  };

  return (
    <section className="packs-page">
      <h1>Content Packs</h1>

      <div className="packs-page__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={async () => {
            setStatus('checking');
            setMessage('Checking for updates...');
            try {
              const found = await checkForPackUpdates();
              setUpdates(found);
              setMessage(found.length === 0 ? 'All packs are up to date.' : `Found ${found.length} update(s).`);
            } catch (error) {
              const text = error instanceof Error ? error.message : 'Unable to check updates.';
              setMessage(text);
            }
            setStatus('idle');
          }}
          disabled={status !== 'idle'}
        >
          Check for updates
        </button>
      </div>

      <p className="packs-page__status">{message}</p>

      {updates.length > 0 ? (
        <section className="packs-page__updates">
          <h2>Available Updates</h2>
          <ul>
            {updates.map((update) => (
              <li key={update.packId}>
                <span>
                  {update.title}: {update.currentVersion} to {update.latestVersion}
                </span>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={async () => {
                    setStatus('installing');
                    setMessage(`Installing ${update.packId}...`);
                    try {
                      await installPack({ url: update.url }, true);
                      await loadData();
                      setMessage(`Installed ${update.packId} ${update.latestVersion}.`);
                      setUpdates((previous) => previous.filter((entry) => entry.packId !== update.packId));
                    } catch (error) {
                      const text = error instanceof Error ? error.message : 'Install failed.';
                      setMessage(text);
                    }
                    setStatus('idle');
                  }}
                  disabled={status !== 'idle'}
                >
                  Install update
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="packs-page__catalog">
        <h2>Catalog by curriculum</h2>
        {domains.map((domain) => {
          const tracks = groupedByDomainAndTrack.get(domain) ?? new Map<string, PackManifestEntry[]>();
          const progress = domainProgress.get(domain);

          return (
            <section key={domain} className="packs-page__domain-group">
              <div className="packs-page__domain-header">
                <h3>{domainLabel(domain)}</h3>
                <div className="packs-page__domain-meta">
                  <span>
                    Installed {progress?.installed ?? 0}/{progress?.total ?? 0}
                  </span>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={async () => {
                      setStatus('installing');
                      setMessage(`Installing ${domainLabel(domain)} starter bundle...`);
                      try {
                        const result = await installDomainStarterBundle(domain);
                        await loadData();
                        setMessage(
                          result.installedCount > 0
                            ? `Installed ${result.installedCount} pack(s) from ${domainLabel(domain)} starter bundle.`
                            : `${domainLabel(domain)} starter bundle is already installed.`
                        );
                      } catch (error) {
                        const text = error instanceof Error ? error.message : 'Bundle install failed.';
                        setMessage(text);
                      }
                      setStatus('idle');
                    }}
                    disabled={status !== 'idle'}
                  >
                    Install domain starter bundle
                  </button>
                </div>
              </div>

              {[...tracks.entries()]
                .sort((left, right) => left[0].localeCompare(right[0]))
                .map(([track, packs]) => (
                  <section key={`${domain}:${track}`} className="packs-page__track-group">
                    <h4>{trackLabel(track)}</h4>
                    <ul>
                      {packs.map((pack) => {
                        const installedPack = installedById.get(pack.packId);
                        const prerequisites = pack.prerequisites ?? [];
                        const missingPrerequisites = prerequisites.filter(
                          (prerequisite) => !installedIdSet.has(prerequisite)
                        );
                        const locked = !installedPack && missingPrerequisites.length > 0;

                        return (
                          <li key={pack.packId}>
                            <div>
                              <strong>{pack.title}</strong>
                              <p>
                                {pack.packId} v{pack.version}
                              </p>
                              {prerequisites.length > 0 ? (
                                <p>
                                  {missingPrerequisites.length > 0
                                    ? `Locked: install ${missingPrerequisites.join(', ')} first.`
                                    : `Prerequisites met: ${prerequisites.join(', ')}.`}
                                </p>
                              ) : (
                                <p>No prerequisites.</p>
                              )}
                            </div>
                            <div className="packs-page__pack-actions">
                              {installedPack ? (
                                <>
                                  <span className="chip chip--topic">installed {installedPack.version}</span>
                                  <button
                                    type="button"
                                    className="btn btn--secondary"
                                    onClick={async () => {
                                      await togglePackFocus(pack.packId);
                                    }}
                                  >
                                    {activePackIds.includes(pack.packId)
                                      ? 'Remove daily focus'
                                      : 'Use in daily focus'}
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn--secondary"
                                  onClick={async () => {
                                    setStatus('installing');
                                    setMessage(`Installing ${pack.packId}...`);
                                    try {
                                      await installPack({ url: pack.url }, false);
                                      await loadData();
                                      setMessage(`Installed ${pack.packId}.`);
                                    } catch (error) {
                                      const text = error instanceof Error ? error.message : 'Install failed.';
                                      setMessage(text);
                                    }
                                    setStatus('idle');
                                  }}
                                  disabled={status !== 'idle' || locked}
                                >
                                  {locked ? 'Locked by prerequisites' : 'Install'}
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
            </section>
          );
        })}
      </section>
    </section>
  );
};
