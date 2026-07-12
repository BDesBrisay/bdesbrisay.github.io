import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'starter-math-v1';
const CARD_PREFIX = 'starter_math';

export const starterMathLegacyDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:math', 'track:starter'];

    return createPack({
      packId: PACK_ID,
      version: '3.0.0',
      title: 'Starter Math (Legacy)',
      topics: ['arithmetic', 'algebra', 'geometry'],
      domain: 'math',
      track: 'starter',
      stage: 'foundation',
      recommendedOrder: 0,
      createdAt,
      cards: [
        cards.quickMath({
          prompt: 'Compute 18 + 27.',
          answer: '45',
          explanation: 'Add tens and ones separately, then combine.',
          tags: [...tags, 'addition'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'Solve x + 9 = 17.',
          answer: '8',
          explanation: 'Subtract nine from both sides.',
          tags: [...tags, 'equations'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'Find area of rectangle 8 by 4.',
          answer: '32',
          explanation: 'Area equals length times width.',
          tags: [...tags, 'geometry'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What is 9 x 9?',
          answer: '81',
          explanation: 'Memorized multiplication facts speed up multi-step math.',
          tags: [...tags, 'multiplication'],
          difficulty: 1
        }),
        cards.conceptCheck({
          prompt: 'Which expression matches "five less than x"?',
          options: ['x - 5', '5 - x', 'x + 5', '5x'],
          answer: 'x - 5',
          explanation: '“Less than” means subtract from x in this phrase.',
          optionExplanations: {
            'x - 5': 'This correctly subtracts five from x.',
            '5 - x': 'This reverses order and changes meaning.',
            'x + 5': 'This means five more than x, not less.',
            '5x': 'This represents multiplication, not subtraction language.'
          },
          tags: [...tags, 'algebraic-language'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'A right angle measures:',
          options: ['90 degrees', '45 degrees', '180 degrees', '360 degrees'],
          answer: '90 degrees',
          explanation: 'Right angles form a quarter turn.',
          optionExplanations: {
            '90 degrees': 'A right angle is defined as ninety degrees.',
            '45 degrees': 'Forty five degrees is an acute angle.',
            '180 degrees': 'One hundred eighty degrees is a straight angle.',
            '360 degrees': 'Three hundred sixty degrees is a full turn.'
          },
          tags: [...tags, 'geometry'],
          difficulty: 1
        })
      ]
    });
  }
};
