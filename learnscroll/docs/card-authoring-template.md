# Card Authoring Template

## JSON Template

```json
{
  "id": "topic_type_###",
  "packId": "starter-pack-id",
  "type": "quick_math",
  "prompt": "Write a focused, single-task prompt.",
  "options": [],
  "answer": "Short canonical answer",
  "explanation": "One concise why/how explanation.",
  "tags": ["topic-tag", "subtopic-tag"],
  "difficulty": 2
}
```

For science `concept_check` cards, include:

```json
{
  "optionExplanations": {
    "Option A": "Explain why this option is right or wrong in 1-2 sentences.",
    "Option B": "Address likely confusion rather than using generic filler.",
    "Option C": "Keep explanation concise and specific to the prompt.",
    "Option D": "Use distinct phrasing, not repeated template text."
  }
}
```

## Authoring Checks

- Prompt should be solvable in under 30 seconds.
- Explanation should be under 2 sentences.
- Avoid ambiguous or opinion-based answers.
- Include tags for scheduler topic balancing.
- Keep difficulty realistic for the intended audience.
- For science concept checks, cover every option with meaningful rationale.
- Distractors should represent realistic misconceptions, not obvious throwaways.
