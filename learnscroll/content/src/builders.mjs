const pad = (value) => String(value).padStart(3, '0');

const assertConceptExplanationCoverage = (options, optionExplanations, cardId) => {
  for (const option of options) {
    if (!optionExplanations[option]) {
      throw new Error(`Card ${cardId} is missing option explanation for \"${option}\".`);
    }
  }

  for (const key of Object.keys(optionExplanations)) {
    if (!options.includes(key)) {
      throw new Error(`Card ${cardId} has explanation for non-option \"${key}\".`);
    }
  }
};

export const createCardFactory = (packId, cardPrefix) => {
  let quickMathCount = 0;
  let conceptCount = 0;
  let factCount = 0;

  const quickMath = ({ prompt, answer, explanation, tags, difficulty }) => {
    quickMathCount += 1;

    return {
      id: `${cardPrefix}_qm_${pad(quickMathCount)}`,
      packId,
      type: 'quick_math',
      prompt,
      options: [],
      answer,
      explanation,
      tags,
      difficulty
    };
  };

  const conceptCheck = ({ prompt, options, answer, explanation, optionExplanations, tags, difficulty }) => {
    conceptCount += 1;

    const cardId = `${cardPrefix}_cc_${pad(conceptCount)}`;
    assertConceptExplanationCoverage(options, optionExplanations, cardId);

    return {
      id: cardId,
      packId,
      type: 'concept_check',
      prompt,
      options,
      answer,
      explanation,
      optionExplanations,
      tags,
      difficulty
    };
  };

  const flashFact = ({ prompt, answer, explanation, tags, difficulty }) => {
    factCount += 1;

    return {
      id: `${cardPrefix}_ff_${pad(factCount)}`,
      packId,
      type: 'flash_fact',
      prompt,
      options: [],
      answer,
      explanation,
      tags,
      difficulty
    };
  };

  return {
    quickMath,
    conceptCheck,
    flashFact
  };
};

export const createPack = ({
  packId,
  version,
  title,
  topics,
  createdAt,
  cards,
  domain,
  track,
  stage,
  recommendedOrder,
  prerequisites
}) => {
  const base = {
    packId,
    version,
    title,
    topics,
    createdAt,
    cards
  };

  if (domain) {
    base.domain = domain;
  }

  if (track) {
    base.track = track;
  }

  if (stage) {
    base.stage = stage;
  }

  if (typeof recommendedOrder === 'number') {
    base.recommendedOrder = recommendedOrder;
  }

  if (prerequisites && prerequisites.length > 0) {
    base.prerequisites = prerequisites;
  }

  return base;
};

export const manifestEntryFromPack = (pack, defaultInstall) => {
  const entry = {
    packId: pack.packId,
    version: pack.version,
    title: pack.title,
    topics: pack.topics,
    url: `/content/packs/${pack.packId}.json`,
    defaultInstall
  };

  if (pack.domain) {
    entry.domain = pack.domain;
  }

  if (pack.track) {
    entry.track = pack.track;
  }

  if (pack.stage) {
    entry.stage = pack.stage;
  }

  if (typeof pack.recommendedOrder === 'number') {
    entry.recommendedOrder = pack.recommendedOrder;
  }

  if (pack.prerequisites && pack.prerequisites.length > 0) {
    entry.prerequisites = pack.prerequisites;
  }

  return entry;
};
