# LearnScroll Sync Protocol

## Endpoint Contract

### `GET /content/manifest.json`

Returns available pack metadata and latest versions.

```json
{
  "generatedAt": "2026-02-26T00:00:00.000Z",
  "packs": [
    {
      "packId": "starter-math-v1",
      "version": "1.0.0",
      "title": "Starter Math",
      "topics": ["arithmetic", "algebra", "math-facts"],
      "url": "/content/packs/starter-math-v1.json",
      "defaultInstall": true
    }
  ]
}
```

### `GET /content/packs/<pack-id>.json`

Returns full pack payload matching the content schema.

## Client Flow

1. Fetch manifest.
2. Compare each installed `packId` version to manifest version.
3. If manifest version is newer, show update prompt.
4. On install/update:
- fetch pack JSON
- validate schema and card IDs
- transactionally replace prior pack cards
- write installed pack metadata (`version`, `installedAt`, `sourceUrl`)

## Failure Handling

- Manifest fetch fails: keep existing installed packs and show non-blocking message.
- Pack download fails: abort install and keep previous pack data.
- Validation fails: reject install and keep previous data.

## Cache Strategy

- Manifest: network-first with cache fallback.
- Pack JSON: stale-while-revalidate.
- App shell: cache-first.
