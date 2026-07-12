import { beforeEach, describe, expect, it } from 'vitest';
import { ensureSeededData } from './seed';
import { db, resetDatabase } from './db';

const manifest = {
  generatedAt: '2026-01-01T00:00:00.000Z',
  packs: [
    {
      packId: 'starter-pack-v1',
      version: '1.0.0',
      title: 'Starter Pack',
      topics: ['math'],
      url: '/content/packs/starter-pack-v1.json',
      defaultInstall: true
    }
  ]
};

const pack = {
  packId: 'starter-pack-v1',
  version: '1.0.0',
  title: 'Starter Pack',
  topics: ['math'],
  createdAt: '2026-01-01T00:00:00.000Z',
  cards: [
    {
      id: 'starter_pack_qm_001',
      packId: 'starter-pack-v1',
      type: 'quick_math',
      prompt: '2+2?',
      options: [],
      answer: '4',
      explanation: 'Add two and two.',
      tags: ['math'],
      difficulty: 1
    }
  ]
};

const resolveUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
};

describe('seed data integration', () => {
  beforeEach(async () => {
    await resetDatabase();

    const mockedFetch: typeof fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const url = resolveUrl(input);

      if (url.endsWith('/content/manifest.json')) {
        return new Response(JSON.stringify(manifest), { status: 200 });
      }

      if (url.endsWith('/content/packs/starter-pack-v1.json')) {
        return new Response(JSON.stringify(pack), { status: 200 });
      }

      return new Response('Not found', { status: 404 });
    };

    globalThis.fetch = mockedFetch;
  });

  it('seeds cards and profile on first run', async () => {
    await ensureSeededData();

    const cardCount = await db.cards.count();
    const profile = await db.profile.get('profile');

    expect(cardCount).toBe(1);
    expect(profile?.sessionGoal).toBe(10);
    expect(profile?.dailyCurriculumMode).toBe('guided');
    expect(profile?.activeDomains).toEqual([]);
    expect(profile?.activeTracks).toEqual([]);
    expect(profile?.activePackIds).toEqual([]);
  });
});
