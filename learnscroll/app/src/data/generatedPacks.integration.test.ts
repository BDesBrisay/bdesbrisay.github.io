import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseContentPack, parsePackManifest } from './packSchemas';

const readJsonFile = async (path: string): Promise<object> => {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content) as object;
};

describe('generated content packs', () => {
  it('parses manifest and all listed pack files', async () => {
    const manifestPath = resolve(process.cwd(), 'public/content/manifest.json');
    const manifestJson = await readJsonFile(manifestPath);
    const manifest = parsePackManifest(manifestJson);

    expect(manifest.packs.length).toBeGreaterThanOrEqual(13);

    for (const pack of manifest.packs) {
      const expectedUrl = `/content/packs/${pack.packId}.json`;
      expect(pack.url).toBe(expectedUrl);

      const packPath = resolve(process.cwd(), 'public', pack.url.replace(/^\//, ''));
      const packJson = await readJsonFile(packPath);
      const parsedPack = parseContentPack(packJson);

      expect(parsedPack.packId).toBe(pack.packId);
      expect(parsedPack.version).toBe(pack.version);
      expect(parsedPack.cards.length).toBeGreaterThan(0);
    }
  });

  it('enforces globally unique card IDs across every generated pack', async () => {
    const manifestPath = resolve(process.cwd(), 'public/content/manifest.json');
    const manifest = parsePackManifest(await readJsonFile(manifestPath));

    const cardIds = new Set<string>();

    for (const pack of manifest.packs) {
      const packPath = resolve(process.cwd(), 'public', pack.url.replace(/^\//, ''));
      const parsedPack = parseContentPack(await readJsonFile(packPath));

      for (const card of parsedPack.cards) {
        expect(cardIds.has(card.id)).toBe(false);
        cardIds.add(card.id);
      }
    }
  });

  it('requires complete option explanations for all concept-check cards', async () => {
    const manifestPath = resolve(process.cwd(), 'public/content/manifest.json');
    const manifest = parsePackManifest(await readJsonFile(manifestPath));

    for (const pack of manifest.packs) {
      const packPath = resolve(process.cwd(), 'public', pack.url.replace(/^\//, ''));
      const parsedPack = parseContentPack(await readJsonFile(packPath));

      const conceptChecks = parsedPack.cards.filter((card) => card.type === 'concept_check');

      for (const card of conceptChecks) {
        expect(card.optionExplanations).toBeDefined();
        expect(Object.keys(card.optionExplanations ?? {}).length).toBe(card.options.length);
      }
    }
  });
});
