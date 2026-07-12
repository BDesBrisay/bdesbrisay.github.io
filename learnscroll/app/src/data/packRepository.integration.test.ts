import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDatabase } from './db';
import { fetchManifest, installDefaultPacksFromManifest } from './packRepository';

const manifest = {
  generatedAt: '2026-01-01T00:00:00.000Z',
  packs: [
    {
      packId: 'math-arithmetic-v1',
      version: '1.0.0',
      title: 'Math Arithmetic',
      topics: ['arithmetic'],
      url: '/content/packs/math-arithmetic-v1.json',
      defaultInstall: true,
      domain: 'math',
      track: 'arithmetic',
      stage: 'foundation',
      recommendedOrder: 1
    },
    {
      packId: 'math-calculus-v1',
      version: '1.0.0',
      title: 'Math Calculus',
      topics: ['calculus'],
      url: '/content/packs/math-calculus-v1.json',
      defaultInstall: false,
      domain: 'math',
      track: 'calculus',
      stage: 'advanced',
      recommendedOrder: 4,
      prerequisites: ['math-arithmetic-v1']
    }
  ]
};

const arithmeticPack = {
  packId: 'math-arithmetic-v1',
  version: '1.0.0',
  title: 'Math Arithmetic',
  topics: ['arithmetic'],
  domain: 'math',
  track: 'arithmetic',
  stage: 'foundation',
  recommendedOrder: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  cards: [
    {
      id: 'math_arithmetic_qm_001',
      packId: 'math-arithmetic-v1',
      type: 'quick_math',
      prompt: '2 + 2',
      options: [],
      answer: '4',
      explanation: 'Simple arithmetic.',
      tags: ['domain:math', 'track:arithmetic'],
      difficulty: 1
    }
  ]
};

const calculusPack = {
  packId: 'math-calculus-v1',
  version: '1.0.0',
  title: 'Math Calculus',
  topics: ['calculus'],
  domain: 'math',
  track: 'calculus',
  stage: 'advanced',
  recommendedOrder: 4,
  prerequisites: ['math-arithmetic-v1'],
  createdAt: '2026-01-01T00:00:00.000Z',
  cards: [
    {
      id: 'math_calculus_qm_001',
      packId: 'math-calculus-v1',
      type: 'quick_math',
      prompt: 'd/dx x^2',
      options: [],
      answer: '2x',
      explanation: 'Power rule.',
      tags: ['domain:math', 'track:calculus'],
      difficulty: 4
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

describe('pack repository integration', () => {
  beforeEach(async () => {
    await resetDatabase();

    const mockedFetch: typeof fetch = async (input: RequestInfo | URL): Promise<Response> => {
      const url = resolveUrl(input);

      if (url.endsWith('/content/manifest.json')) {
        return new Response(JSON.stringify(manifest), { status: 200 });
      }

      if (url.endsWith('/content/packs/math-arithmetic-v1.json')) {
        return new Response(JSON.stringify(arithmeticPack), { status: 200 });
      }

      if (url.endsWith('/content/packs/math-calculus-v1.json')) {
        return new Response(JSON.stringify(calculusPack), { status: 200 });
      }

      return new Response('Not found', { status: 404 });
    };

    globalThis.fetch = mockedFetch;
  });

  it('keeps non-default packs catalog-only when installing defaults', async () => {
    const manifestResult = await fetchManifest();
    expect(manifestResult.packs).toHaveLength(2);

    const installedCount = await installDefaultPacksFromManifest();
    expect(installedCount).toBe(1);

    const installedPacks = await db.contentPacks.toArray();
    expect(installedPacks).toHaveLength(1);
    expect(installedPacks[0]?.id).toBe('math-arithmetic-v1');
    expect(await db.cards.count()).toBe(1);
  });
});
