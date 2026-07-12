import { z } from 'zod';
import type { ContentPackData, PackManifest } from '../types/domain';

const cardTypeSchema = z.enum(['quick_math', 'concept_check', 'flash_fact']);
const curriculumDomainSchema = z.enum(['math', 'science', 'computer-science']);
const curriculumStageSchema = z.enum(['foundation', 'core', 'advanced']);
const packIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*-v\d+$/);
const trackSchema = z.string().trim().min(1).max(64).regex(/^[a-z0-9-]+$/);
const prerequisiteSchema = packIdSchema;
const optionExplanationSchema = z.string().trim().min(16).max(220);
const optionExplanationMapSchema = z.record(z.string(), optionExplanationSchema);

const cardSchema = z
  .object({
    id: z.string().min(1),
    packId: z.string().min(1),
    type: cardTypeSchema,
    prompt: z.string().min(1),
    options: z.array(z.string().trim().min(1)),
    answer: z.string().min(1),
    explanation: z.string().min(1),
    optionExplanations: optionExplanationMapSchema.optional(),
    autoAdvanceMs: z.number().int().min(200).max(5000).optional(),
    tags: z.array(z.string().min(1)).min(1),
    difficulty: z.number().int().min(1).max(5)
  })
  .superRefine((card, context) => {
    const uniqueOptions = new Set(card.options);
    if (uniqueOptions.size !== card.options.length) {
      context.addIssue({
        code: 'custom',
        path: ['options'],
        message: `Card ${card.id} contains duplicate options.`
      });
    }

    if (card.type === 'concept_check') {
      if (card.options.length < 2) {
        context.addIssue({
          code: 'custom',
          path: ['options'],
          message: `Card ${card.id} must include at least two options.`
        });
      }

      if (!card.options.includes(card.answer)) {
        context.addIssue({
          code: 'custom',
          path: ['answer'],
          message: `Card ${card.id} answer must match one listed option.`
        });
      }

      if (!card.optionExplanations) {
        context.addIssue({
          code: 'custom',
          path: ['optionExplanations'],
          message: `Concept-check card ${card.id} must include option explanations.`
        });
        return;
      }

      for (const option of card.options) {
        if (!card.optionExplanations[option]) {
          context.addIssue({
            code: 'custom',
            path: ['optionExplanations', option],
            message: `Card ${card.id} is missing an explanation for option "${option}".`
          });
        }
      }

      for (const key of Object.keys(card.optionExplanations)) {
        if (!card.options.includes(key)) {
          context.addIssue({
            code: 'custom',
            path: ['optionExplanations', key],
            message: `Card ${card.id} has an explanation for non-option "${key}".`
          });
        }
      }

      return;
    }

    if (card.optionExplanations) {
      context.addIssue({
        code: 'custom',
        path: ['optionExplanations'],
        message: `Card ${card.id} can only define option explanations for concept checks.`
      });
    }
  })
  .strict();

const packSchema = z
  .object({
    packId: packIdSchema,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    title: z.string().min(1),
    topics: z.array(z.string().min(1)).min(1),
    createdAt: z.string().datetime(),
    cards: z.array(cardSchema).min(1),
    domain: curriculumDomainSchema.optional(),
    track: trackSchema.optional(),
    stage: curriculumStageSchema.optional(),
    recommendedOrder: z.number().int().min(0).optional(),
    prerequisites: z.array(prerequisiteSchema).min(1).optional()
  })
  .superRefine((pack, context) => {
    const prerequisiteSet = new Set<string>();

    if (pack.track && !pack.domain) {
      context.addIssue({
        code: 'custom',
        path: ['track'],
        message: `Pack ${pack.packId} cannot define track without a domain.`
      });
    }

    if (pack.stage && !pack.domain) {
      context.addIssue({
        code: 'custom',
        path: ['stage'],
        message: `Pack ${pack.packId} cannot define stage without a domain.`
      });
    }

    if (pack.recommendedOrder !== undefined && !pack.domain) {
      context.addIssue({
        code: 'custom',
        path: ['recommendedOrder'],
        message: `Pack ${pack.packId} cannot define recommendedOrder without a domain.`
      });
    }

    for (const prerequisite of pack.prerequisites ?? []) {
      if (prerequisite === pack.packId) {
        context.addIssue({
          code: 'custom',
          path: ['prerequisites'],
          message: `Pack ${pack.packId} cannot reference itself as a prerequisite.`
        });
      }

      if (prerequisiteSet.has(prerequisite)) {
        context.addIssue({
          code: 'custom',
          path: ['prerequisites'],
          message: `Pack ${pack.packId} contains duplicate prerequisite ${prerequisite}.`
        });
      }

      prerequisiteSet.add(prerequisite);
    }

    pack.cards.forEach((card, index) => {
      if (card.packId !== pack.packId) {
        context.addIssue({
          code: 'custom',
          path: ['cards', index, 'packId'],
          message: `Card ${card.id} packId must match "${pack.packId}".`
        });
      }
    });
  })
  .strict();

const manifestPackEntrySchema = z
  .object({
    packId: packIdSchema,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    title: z.string().min(1),
    topics: z.array(z.string().min(1)).min(1),
    url: z.string().regex(/^\/content\/packs\/[a-z0-9]+(?:-[a-z0-9]+)*-v\d+\.json$/),
    defaultInstall: z.boolean(),
    domain: curriculumDomainSchema.optional(),
    track: trackSchema.optional(),
    stage: curriculumStageSchema.optional(),
    recommendedOrder: z.number().int().min(0).optional(),
    prerequisites: z.array(prerequisiteSchema).min(1).optional()
  })
  .strict();

const manifestSchema = z
  .object({
    generatedAt: z.string().datetime(),
    packs: z.array(manifestPackEntrySchema).min(1)
  })
  .strict()
  .superRefine((manifest, context) => {
    const packIdSet = new Set<string>();

    for (const entry of manifest.packs) {
      if (packIdSet.has(entry.packId)) {
        context.addIssue({
          code: 'custom',
          path: ['packs'],
          message: `Manifest contains duplicate pack id ${entry.packId}.`
        });
      }
      packIdSet.add(entry.packId);

      if (!entry.url.endsWith(`${entry.packId}.json`)) {
        context.addIssue({
          code: 'custom',
          path: ['packs'],
          message: `Manifest url ${entry.url} does not match pack id ${entry.packId}.`
        });
      }
    }

    for (const entry of manifest.packs) {
      const prerequisiteSet = new Set<string>();
      for (const prerequisite of entry.prerequisites ?? []) {
        if (prerequisite === entry.packId) {
          context.addIssue({
            code: 'custom',
            path: ['packs'],
            message: `Pack ${entry.packId} cannot reference itself as a prerequisite.`
          });
        }

        if (prerequisiteSet.has(prerequisite)) {
          context.addIssue({
            code: 'custom',
            path: ['packs'],
            message: `Pack ${entry.packId} contains duplicate prerequisite ${prerequisite}.`
          });
        }
        prerequisiteSet.add(prerequisite);

        if (!packIdSet.has(prerequisite)) {
          context.addIssue({
            code: 'custom',
            path: ['packs'],
            message: `Pack ${entry.packId} references unknown prerequisite ${prerequisite}.`
          });
        }
      }
    }
  });

const ensureUniqueCardIds = (pack: ContentPackData): ContentPackData => {
  const seen = new Set<string>();
  for (const card of pack.cards) {
    if (seen.has(card.id)) {
      throw new Error(`Duplicate card id found: ${card.id}`);
    }
    seen.add(card.id);
  }
  return pack;
};

export const parseContentPack = (value: object): ContentPackData => {
  const parsed = packSchema.parse(value);
  return ensureUniqueCardIds(parsed);
};

export const parsePackManifest = (value: object): PackManifest => {
  return manifestSchema.parse(value);
};
