import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'math-arithmetic-v1';
const CARD_PREFIX = 'math_arithmetic';

export const mathArithmeticDefinition = {
  packId: PACK_ID,
  defaultInstall: true,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:math', 'track:arithmetic'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Math Arithmetic',
      topics: ['arithmetic', 'number sense', 'fractions', 'percent'],
      domain: 'math',
      track: 'arithmetic',
      stage: 'foundation',
      recommendedOrder: 1,
      createdAt,
      cards: [
        cards.quickMath({
          prompt: 'Compute 27 + 38.',
          answer: '65',
          explanation: 'Add tens and ones, or add 30 then adjust by -3.',
          tags: [...tags, 'addition'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'Compute 84 - 29.',
          answer: '55',
          explanation: 'Subtract 30 to get 54, then add 1 back.',
          tags: [...tags, 'subtraction'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'Compute 14 x 6.',
          answer: '84',
          explanation: 'Break 14 into 10 and 4, then add partial products.',
          tags: [...tags, 'multiplication'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'Compute 144 / 12.',
          answer: '12',
          explanation: 'Think of the multiplication fact 12 x 12 = 144.',
          tags: [...tags, 'division'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'Find 3/5 of 40.',
          answer: '24',
          explanation: 'One fifth is 8, then multiply by three.',
          tags: [...tags, 'fractions'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'Convert 0.72 to a percent.',
          answer: '72%',
          explanation: 'Multiply decimal form by 100 and add the percent sign.',
          tags: [...tags, 'percent'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'A notebook costs $3.50 each. What is the total for 8 notebooks?',
          answer: '$28',
          explanation: 'Multiply the unit price by quantity: 3.5 x 8.',
          tags: [...tags, 'unit-rate'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'Round 6.47 to the nearest tenth.',
          answer: '6.5',
          explanation: 'The hundredths digit is 7, so the tenths rounds up.',
          tags: [...tags, 'decimals'],
          difficulty: 1
        }),
        cards.conceptCheck({
          prompt: 'Which expression is equivalent to 36 / 9?',
          options: ['4', '9 x 4', '36 - 9', '9 / 36'],
          answer: '4',
          explanation: 'Division asks how many groups; 36 divided by 9 gives 4 groups.',
          optionExplanations: {
            '4': 'Thirty six divided by nine equals four.',
            '9 x 4': 'This equals thirty six, but division asks for the resulting group count.',
            '36 - 9': 'This subtraction equals 27, which does not match the quotient 4.',
            '9 / 36': 'This is one fourth, the reciprocal relationship of 36 divided by 9.'
          },
          tags: [...tags, 'division'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'A value increases from 50 to 60. What is the percent increase?',
          options: ['10%', '20%', '25%', '50%'],
          answer: '20%',
          explanation: 'The change is 10 on a base of 50, so 10/50 equals 0.2.',
          optionExplanations: {
            '10%': 'Ten percent of fifty is only five, so this underestimates the change.',
            '20%': 'Ten divided by fifty is 0.2, which is twenty percent.',
            '25%': 'Twenty five percent of fifty would be 12.5, larger than the actual increase.',
            '50%': 'A fifty percent increase from fifty would land at seventy five.'
          },
          tags: [...tags, 'percent'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which value is the best estimate for 199 + 302?',
          options: ['401', '500', '700', '100'],
          answer: '500',
          explanation: 'Rounding to 200 and 300 gives a fast estimate of 500.',
          optionExplanations: {
            '401': 'This is close to the exact sum but is not the rounded estimate target.',
            '500': 'Rounded addends 200 and 300 produce the estimate 500.',
            '700': 'This overestimates because neither addend rounds near 350.',
            '100': 'This is far too small for adding two numbers around two hundred and three hundred.'
          },
          tags: [...tags, 'estimation'],
          difficulty: 1
        }),
        cards.conceptCheck({
          prompt: 'Which fraction is equivalent to 3/4?',
          options: ['6/8', '9/16', '12/20', '2/3'],
          answer: '6/8',
          explanation: 'Multiply numerator and denominator by the same number to keep value.',
          optionExplanations: {
            '6/8': 'Both parts were doubled from three fourths, so the value stays equal.',
            '9/16': 'This ratio is smaller than three fourths because denominator grew more.',
            '12/20': 'This simplifies to three fifths, not three fourths.',
            '2/3': 'Two thirds is close but still less than three fourths.'
          },
          tags: [...tags, 'fractions'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'You split 42 apples evenly into 6 boxes. How many apples per box?',
          options: ['6', '7', '8', '12'],
          answer: '7',
          explanation: 'Division models equal groups, so 42 / 6 gives each box count.',
          optionExplanations: {
            '6': 'Six boxes is the number of groups, not the apples in each group.',
            '7': 'Forty two divided by six gives seven apples per box.',
            '8': 'Eight per box would require forty eight apples total.',
            '12': 'Twelve is double six, but it does not satisfy the total of forty two.'
          },
          tags: [...tags, 'division', 'word-problem'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which statement about 0.4 and 40% is true?',
          options: ['0.4 is greater than 40%', '0.4 equals 40%', '0.4 is less than 40%', 'They cannot be compared'],
          answer: '0.4 equals 40%',
          explanation: 'Percent means per 100, so 40% is 40/100 which equals 0.4.',
          optionExplanations: {
            '0.4 is greater than 40%': 'Both values represent the same quantity, so neither is greater.',
            '0.4 equals 40%': 'Forty percent converts directly to decimal form 0.4.',
            '0.4 is less than 40%': 'This reverses the relationship; they are equivalent forms.',
            'They cannot be compared': 'They are different formats for the same numeric value.'
          },
          tags: [...tags, 'decimals', 'percent'],
          difficulty: 1
        })
      ]
    });
  }
};
