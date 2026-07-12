import { useEffect, useMemo, useState } from 'react';
import { fetchManifest } from '../../data/packRepository';
import { MAX_AUTO_ADVANCE_DELAY_MS, MIN_AUTO_ADVANCE_DELAY_MS } from '../../data/profile';
import { useSessionStore } from '../../store/sessionStore';
import type { CurriculumDomain, PackManifestEntry } from '../../types/domain';

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

interface TrackOption {
  domain: CurriculumDomain;
  track: string;
}

export const SettingsPage = () => {
  const {
    sessionGoal,
    setSessionGoal,
    autoAdvanceEnabled,
    autoAdvanceDelayMs,
    setAutoAdvanceSettings,
    activeDomains,
    activeTracks,
    dailyCurriculumMode,
    setCurriculumPreferences,
    startSession
  } = useSessionStore();
  const [goalValue, setGoalValue] = useState(sessionGoal);
  const [autoEnabled, setAutoEnabled] = useState(autoAdvanceEnabled);
  const [delayValue, setDelayValue] = useState(autoAdvanceDelayMs);
  const [modeValue, setModeValue] = useState(dailyCurriculumMode);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(activeDomains);
  const [selectedTracks, setSelectedTracks] = useState<string[]>(activeTracks);
  const [manifestPacks, setManifestPacks] = useState<PackManifestEntry[]>([]);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    setGoalValue(sessionGoal);
  }, [sessionGoal]);

  useEffect(() => {
    setAutoEnabled(autoAdvanceEnabled);
    setDelayValue(autoAdvanceDelayMs);
  }, [autoAdvanceDelayMs, autoAdvanceEnabled]);

  useEffect(() => {
    setModeValue(dailyCurriculumMode);
    setSelectedDomains(activeDomains);
    setSelectedTracks(activeTracks);
  }, [activeDomains, activeTracks, dailyCurriculumMode]);

  useEffect(() => {
    const loadManifest = async (): Promise<void> => {
      const manifest = await fetchManifest();
      setManifestPacks(manifest.packs);
    };

    void loadManifest();
  }, []);

  const domainOptions = useMemo<CurriculumDomain[]>(() => {
    const domains = manifestPacks
      .map((pack) => pack.domain)
      .filter((domain): domain is CurriculumDomain => Boolean(domain));

    return [...new Set(domains)].sort((left, right) => left.localeCompare(right));
  }, [manifestPacks]);

  const trackOptions = useMemo<TrackOption[]>(() => {
    const seen = new Set<string>();
    const options: TrackOption[] = [];

    const sorted = [...manifestPacks].sort((left, right) => {
      const leftOrder = left.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return left.packId.localeCompare(right.packId);
    });

    for (const pack of sorted) {
      if (!pack.domain || !pack.track) {
        continue;
      }

      const key = `${pack.domain}:${pack.track}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      options.push({ domain: pack.domain, track: pack.track });
    }

    return options;
  }, [manifestPacks]);

  return (
    <section className="settings-page">
      <h1>Settings</h1>
      <label htmlFor="session-goal" className="settings-page__label">
        Session goal (cards)
      </label>
      <input
        id="session-goal"
        type="range"
        min={5}
        max={40}
        step={1}
        value={goalValue}
        onChange={(event) => {
          setGoalValue(Number(event.currentTarget.value));
        }}
      />
      <div className="settings-page__value">{goalValue} cards</div>

      <section className="settings-page__group">
        <h2>Accessibility and pacing</h2>
        <label htmlFor="auto-advance-toggle" className="settings-page__toggle">
          <input
            id="auto-advance-toggle"
            type="checkbox"
            checked={autoEnabled}
            onChange={(event) => {
              setAutoEnabled(event.currentTarget.checked);
            }}
          />
          Auto-advance after grading
        </label>

        <label htmlFor="auto-advance-delay" className="settings-page__label">
          Concept-check auto-advance delay ({delayValue} ms)
        </label>
        <input
          id="auto-advance-delay"
          type="range"
          min={MIN_AUTO_ADVANCE_DELAY_MS}
          max={MAX_AUTO_ADVANCE_DELAY_MS}
          step={100}
          value={delayValue}
          disabled={!autoEnabled}
          onChange={(event) => {
            setDelayValue(Number(event.currentTarget.value));
          }}
        />
        <p className="settings-page__hint">
          Turn auto-advance off if you need to pause before moving to the next card.
        </p>
      </section>

      <section className="settings-page__group">
        <h2>Curriculum mode</h2>
        <label htmlFor="curriculum-mode-guided" className="settings-page__toggle">
          <input
            id="curriculum-mode-guided"
            type="radio"
            name="curriculum-mode"
            checked={modeValue === 'guided'}
            onChange={() => {
              setModeValue('guided');
            }}
          />
          Guided (active-track weighted blend)
        </label>
        <label htmlFor="curriculum-mode-mixed" className="settings-page__toggle">
          <input
            id="curriculum-mode-mixed"
            type="radio"
            name="curriculum-mode"
            checked={modeValue === 'mixed'}
            onChange={() => {
              setModeValue('mixed');
            }}
          />
          Mixed (more review-heavy blend)
        </label>
      </section>

      <section className="settings-page__group">
        <h2>Active domains</h2>
        <div className="settings-page__chips">
          {domainOptions.map((domain) => {
            const checked = selectedDomains.includes(domain);

            return (
              <label key={domain} className="settings-page__toggle">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setSelectedDomains((previous) => {
                      if (event.currentTarget.checked) {
                        return [...previous, domain];
                      }
                      return previous.filter((item) => item !== domain);
                    });
                  }}
                />
                {domainLabel(domain)}
              </label>
            );
          })}
        </div>
        <p className="settings-page__hint">Leave all unchecked to include every installed domain.</p>
      </section>

      <section className="settings-page__group">
        <h2>Active tracks</h2>
        <div className="settings-page__chips">
          {trackOptions.map((option) => {
            const checked = selectedTracks.includes(option.track);

            return (
              <label key={`${option.domain}:${option.track}`} className="settings-page__toggle">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    setSelectedTracks((previous) => {
                      if (event.currentTarget.checked) {
                        return [...previous, option.track];
                      }
                      return previous.filter((item) => item !== option.track);
                    });
                  }}
                />
                {trackLabel(option.track)} ({domainLabel(option.domain)})
              </label>
            );
          })}
        </div>
        <p className="settings-page__hint">Tracks are used after pack-level focus and before full-pool fallback.</p>
      </section>

      <button
        type="button"
        className="btn btn--primary"
        onClick={async () => {
          await setSessionGoal(goalValue);
          await setAutoAdvanceSettings(autoEnabled, delayValue);
          await setCurriculumPreferences(selectedDomains, selectedTracks, modeValue);
          await startSession();
          setSaved('Saved');
        }}
      >
        Save settings
      </button>

      <p className="settings-page__hint">{saved}</p>
      <p className="settings-page__hint">Use 10-15 for short breaks, 20+ for focused sessions.</p>
    </section>
  );
};
