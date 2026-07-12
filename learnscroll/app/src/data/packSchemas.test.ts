import { describe, expect, it } from 'vitest';
import { parseContentPack, parsePackManifest } from './packSchemas';

const basePack = {
  packId: 'pack-a-v1',
  version: '1.0.0',
  title: 'Pack A',
  topics: ['topic-a'],
  createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  cards: [
    {
      id: 'pack_a_qm_001',
      packId: 'pack-a-v1',
      type: 'quick_math',
      prompt: '2+2?',
      options: [],
      answer: '4',
      explanation: 'Simple arithmetic.',
      tags: ['domain:math', 'track:arithmetic'],
      difficulty: 1
    }
  ]
};

describe('content pack schema', () => {
  it('parses valid packs with curriculum metadata', () => {
    const parsed = parseContentPack({
      ...basePack,
      domain: 'math',
      track: 'arithmetic',
      stage: 'foundation',
      recommendedOrder: 1
    });

    expect(parsed.packId).toBe('pack-a-v1');
    expect(parsed.domain).toBe('math');
    expect(parsed.stage).toBe('foundation');
  });

  it('rejects duplicate card IDs', () => {
    const duplicated = {
      ...basePack,
      cards: [...basePack.cards, { ...basePack.cards[0] }]
    };

    expect(() => parseContentPack(duplicated)).toThrow(/Duplicate card id/);
  });

  it('requires option explanations for every concept-check card', () => {
    const conceptPack = {
      ...basePack,
      cards: [
        {
          id: 'pack_a_cc_001',
          packId: 'pack-a-v1',
          type: 'concept_check',
          prompt: 'Which value equals 2 + 2?',
          options: ['3', '4'],
          answer: '4',
          explanation: 'Addition of two and two gives four.',
          tags: ['domain:math', 'track:arithmetic'],
          difficulty: 1
        }
      ]
    };

    expect(() => parseContentPack(conceptPack)).toThrow(/must include option explanations/);
  });

  it('rejects prerequisite self-reference', () => {
    const packWithSelfReference = {
      ...basePack,
      prerequisites: ['pack-a-v1']
    };

    expect(() => parseContentPack(packWithSelfReference)).toThrow(/cannot reference itself/);
  });

  it('rejects track metadata without domain metadata', () => {
    const packWithTrackOnly = {
      ...basePack,
      track: 'arithmetic'
    };

    expect(() => parseContentPack(packWithTrackOnly)).toThrow(/without a domain/);
  });
});

describe('manifest schema', () => {
  it('parses a valid manifest with prerequisites', () => {
    const manifest = parsePackManifest({
      generatedAt: '2026-02-01T00:00:00.000Z',
      packs: [
        {
          packId: 'pack-a-v1',
          version: '1.0.0',
          title: 'Pack A',
          topics: ['a'],
          url: '/content/packs/pack-a-v1.json',
          defaultInstall: true,
          domain: 'math',
          track: 'arithmetic',
          stage: 'foundation',
          recommendedOrder: 1
        },
        {
          packId: 'pack-b-v1',
          version: '1.0.0',
          title: 'Pack B',
          topics: ['b'],
          url: '/content/packs/pack-b-v1.json',
          defaultInstall: false,
          domain: 'math',
          track: 'algebra-charting',
          stage: 'core',
          recommendedOrder: 2,
          prerequisites: ['pack-a-v1']
        }
      ]
    });

    expect(manifest.packs).toHaveLength(2);
    expect(manifest.packs[1]?.prerequisites).toEqual(['pack-a-v1']);
  });

  it('rejects unknown prerequisite references in manifest', () => {
    expect(() =>
      parsePackManifest({
        generatedAt: '2026-02-01T00:00:00.000Z',
        packs: [
          {
            packId: 'pack-a-v1',
            version: '1.0.0',
            title: 'Pack A',
            topics: ['a'],
            url: '/content/packs/pack-a-v1.json',
            defaultInstall: true,
            domain: 'math',
            track: 'arithmetic',
            stage: 'foundation',
            recommendedOrder: 1,
            prerequisites: ['missing-pack-v1']
          }
        ]
      })
    ).toThrow(/unknown prerequisite/);
  });
});
