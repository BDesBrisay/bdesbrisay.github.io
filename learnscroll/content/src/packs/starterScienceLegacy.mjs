import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'starter-science-v1';
const CARD_PREFIX = 'starter_science';

export const starterScienceLegacyDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:science', 'track:starter'];

    return createPack({
      packId: PACK_ID,
      version: '3.0.0',
      title: 'Starter Science (Legacy)',
      topics: ['physics basics', 'biology basics', 'earth-space basics'],
      domain: 'science',
      track: 'starter',
      stage: 'foundation',
      recommendedOrder: 0,
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'What force pulls objects toward Earth?',
          answer: 'gravity',
          explanation: 'Gravity causes falling motion and helps maintain orbital paths.',
          tags: [...tags, 'forces'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What gas do humans inhale for aerobic respiration?',
          answer: 'oxygen',
          explanation: 'Oxygen supports cellular respiration for ATP production.',
          tags: [...tags, 'human-biology'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'Which planet is known as the Red Planet?',
          answer: 'Mars',
          explanation: 'Iron-rich surface minerals give Mars a reddish appearance.',
          tags: [...tags, 'astronomy'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'If speed is 12 m/s for 5 s, distance is:',
          answer: '60 m',
          explanation: 'Distance equals speed multiplied by time in constant-speed motion.',
          tags: [...tags, 'mechanics'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which organelle controls what enters and leaves a cell?',
          options: ['Cell membrane', 'Nucleus', 'Ribosome', 'Golgi apparatus'],
          answer: 'Cell membrane',
          explanation: 'The membrane acts as a selective barrier around the cell.',
          optionExplanations: {
            'Cell membrane': 'Transport regulation is a defining role of the membrane.',
            Nucleus: 'The nucleus stores DNA but is not the outer boundary controller.',
            Ribosome: 'Ribosomes synthesize proteins from messenger RNA.',
            'Golgi apparatus': 'Golgi modifies and packages molecules, not boundary transport control.'
          },
          tags: [...tags, 'cells'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'What causes Earth seasons?',
          options: ['Axial tilt', 'Monthly distance swings from Sun', 'Moon phases', 'Rotation speed changes each week'],
          answer: 'Axial tilt',
          explanation: 'Tilt changes sunlight angle and day length across the year.',
          optionExplanations: {
            'Axial tilt': 'Earth tilt relative to orbit is the main seasonal driver.',
            'Monthly distance swings from Sun': 'Distance changes are small and not aligned with seasonal cycle.',
            'Moon phases': 'Moon phases affect night illumination, not seasonal climate.',
            'Rotation speed changes each week': 'Rotation speed is stable and not a seasonal mechanism.'
          },
          tags: [...tags, 'earth-space'],
          difficulty: 2
        })
      ]
    });
  }
};
