# LearnScroll Content Schema

## Card Types

- `quick_math`: free-think and self-grade after reveal.
- `concept_check`: multiple-choice immediate check.
- `flash_fact`: recall and reveal.

## Curriculum Metadata

All curriculum-aware packs can include:

- `domain`: `math | science | computer-science`
- `track`: lowercase slug (for example `algebra-charting`)
- `stage`: `foundation | core | advanced`
- `recommendedOrder`: non-negative integer
- `prerequisites`: array of pack IDs

Metadata fields are optional for backward compatibility, but if present they are strictly validated.

## Content Pack Schema

```json
{
  "packId": "math-arithmetic-v1",
  "version": "1.0.0",
  "title": "Math Arithmetic",
  "topics": ["arithmetic", "number sense", "fractions", "percent"],
  "domain": "math",
  "track": "arithmetic",
  "stage": "foundation",
  "recommendedOrder": 1,
  "createdAt": "2026-02-27T00:00:00.000Z",
  "cards": [
    {
      "id": "math_arithmetic_qm_001",
      "packId": "math-arithmetic-v1",
      "type": "quick_math",
      "prompt": "Compute 27 + 38.",
      "options": [],
      "answer": "65",
      "explanation": "Add tens and ones, or add 30 then adjust by -3.",
      "tags": ["domain:math", "track:arithmetic", "addition"],
      "difficulty": 1
    },
    {
      "id": "math_arithmetic_cc_001",
      "packId": "math-arithmetic-v1",
      "type": "concept_check",
      "prompt": "Which statement about 0.4 and 40% is true?",
      "options": [
        "0.4 is greater than 40%",
        "0.4 equals 40%",
        "0.4 is less than 40%",
        "They cannot be compared"
      ],
      "answer": "0.4 equals 40%",
      "explanation": "Percent means per 100, so 40% is 40/100 which equals 0.4.",
      "optionExplanations": {
        "0.4 is greater than 40%": "Both values represent the same quantity, so neither is greater.",
        "0.4 equals 40%": "Forty percent converts directly to decimal form 0.4.",
        "0.4 is less than 40%": "This reverses the relationship; they are equivalent forms.",
        "They cannot be compared": "They are different formats for the same numeric value."
      },
      "autoAdvanceMs": 1500,
      "tags": ["domain:math", "track:arithmetic", "decimals", "percent"],
      "difficulty": 1
    }
  ]
}
```

## Manifest Schema

Each manifest entry mirrors pack metadata plus install source:

- `packId`
- `version`
- `title`
- `topics`
- `url` (`/content/packs/<packId>.json`)
- `defaultInstall`
- optional curriculum metadata fields

## Validation Rules

Validation runs before install and during tests:

- strict object shapes
- semver format (`x.y.z`)
- pack ID format (`<slug>-v<major>`)
- `packId` parity between each card and parent pack
- duplicate card IDs rejected per pack
- duplicate pack IDs rejected in manifest
- manifest URL must match pack ID
- `track`, `stage`, and `recommendedOrder` require `domain`
- prerequisites must be valid pack IDs, must not self-reference, and must not duplicate
- `concept_check` answer must be one of its options
- no duplicate options in a concept-check card
- every concept-check must include `optionExplanations`
- `optionExplanations` keys must match options exactly
- each explanation value must be 16-220 trimmed characters

## Authoring Conventions

- Card IDs must be namespaced by pack prefix (for example `math_arithmetic_qm_001`).
- Include `domain:<value>` and `track:<value>` tags on every card.
- Keep difficulty spread aligned to scheduler buckets:
  - `1-2` foundational
  - `3` intermediate
  - `4-5` advanced
- Maintain concise option rationales optimized for mobile reading.
- Keep distractors plausible but clearly distinguishable with explanation.

## Generator Workflow

Source of truth:

- `content/src/registry.mjs`
- `content/src/packs/*.mjs`

Generate artifacts:

```bash
node scripts/generate-packs.mjs
```

Outputs:

- `content/manifest.json`
- `content/packs/*.json`
- `app/public/content/manifest.json`
- `app/public/content/packs/*.json`

Generation-time gates:

- duplicate pack ID check
- duplicate card ID check across all packs
- prerequisite reference validation
- manifest URL-to-pack mapping validation
- deterministic registry-ordered output
