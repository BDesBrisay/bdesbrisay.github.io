import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'math-calculus-v1';
const CARD_PREFIX = 'math_calculus';

export const mathCalculusDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:math', 'track:calculus'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Math Calculus',
      topics: ['limits', 'derivatives', 'integrals', 'applications'],
      domain: 'math',
      track: 'calculus',
      stage: 'advanced',
      recommendedOrder: 4,
      prerequisites: ['math-algebra-charting-v1', 'math-geometry-v1'],
      createdAt,
      cards: [
        cards.quickMath({
          prompt: 'Compute the limit as x approaches 3 of (x^2 - 9) / (x - 3).',
          answer: '6',
          explanation: 'Factor numerator, cancel x - 3, then evaluate x + 3 at x = 3.',
          tags: [...tags, 'limits'],
          difficulty: 4
        }),
        cards.quickMath({
          prompt: 'Find d/dx of x^3.',
          answer: '3x^2',
          explanation: 'Apply the power rule n*x^(n-1).',
          tags: [...tags, 'derivatives', 'power-rule'],
          difficulty: 3
        }),
        cards.quickMath({
          prompt: 'Find d/dx of 5x^2 - 4x + 9.',
          answer: '10x - 4',
          explanation: 'Differentiate each term and constants go to zero.',
          tags: [...tags, 'derivatives'],
          difficulty: 3
        }),
        cards.quickMath({
          prompt: 'Evaluate the integral from 0 to 2 of 3x dx.',
          answer: '6',
          explanation: 'Antiderivative is 1.5x^2; evaluate at 2 and subtract value at 0.',
          tags: [...tags, 'integrals'],
          difficulty: 4
        }),
        cards.quickMath({
          prompt: 'If position is s(t) = t^2 + 2t, what is velocity v(t)?',
          answer: '2t + 2',
          explanation: 'Velocity is derivative of position with respect to time.',
          tags: [...tags, 'derivatives', 'motion'],
          difficulty: 4
        }),
        cards.quickMath({
          prompt: 'Find d/dx of sin(x).',
          answer: 'cos(x)',
          explanation: 'This is a standard basic derivative identity.',
          tags: [...tags, 'derivatives', 'trigonometry'],
          difficulty: 4
        }),
        cards.quickMath({
          prompt: 'Approximate area under f(x)=x from 0 to 1 using one midpoint rectangle.',
          answer: '0.5',
          explanation: 'Midpoint is x = 0.5 with height 0.5 and width 1.',
          tags: [...tags, 'integrals', 'area-model'],
          difficulty: 4
        }),
        cards.quickMath({
          prompt: 'If f\'(2) = -3, what does this tell you about f at x = 2?',
          answer: 'It is decreasing at x = 2',
          explanation: 'Negative derivative means local downward slope at that point.',
          tags: [...tags, 'derivatives', 'interpretation'],
          difficulty: 4
        }),
        cards.conceptCheck({
          prompt: 'Which limit expression defines the derivative f\'(x)?',
          options: ['lim h->0 [f(x+h)-f(x)]/h', 'lim h->0 [f(x+h)+f(x)]/h', 'lim x->0 f(x)/x', 'lim h->0 [f(h)-f(x)]/x'],
          answer: 'lim h->0 [f(x+h)-f(x)]/h',
          explanation: 'Derivative is the limit of average rate of change over shrinking intervals.',
          optionExplanations: {
            'lim h->0 [f(x+h)-f(x)]/h': 'This is the standard difference-quotient definition of derivative.',
            'lim h->0 [f(x+h)+f(x)]/h': 'Adding values does not measure change over an interval.',
            'lim x->0 f(x)/x': 'This may appear in special limits but is not the general derivative definition.',
            'lim h->0 [f(h)-f(x)]/x': 'Denominator should be h, and the numerator should compare x+h with x.'
          },
          tags: [...tags, 'limits', 'derivatives'],
          difficulty: 4
        }),
        cards.conceptCheck({
          prompt: 'If f\'(x) > 0 on an interval, which statement is true?',
          options: ['f is increasing there', 'f is decreasing there', 'f is constant there', 'f has no graph there'],
          answer: 'f is increasing there',
          explanation: 'Positive slope indicates outputs rise as inputs increase.',
          optionExplanations: {
            'f is increasing there': 'Positive derivative corresponds to increasing function behavior.',
            'f is decreasing there': 'Decreasing behavior needs negative derivative values.',
            'f is constant there': 'Constant functions have derivative zero, not positive.',
            'f has no graph there': 'Derivative sign says nothing about graph existence on its own.'
          },
          tags: [...tags, 'derivatives', 'interpretation'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'What does a definite integral primarily represent?',
          options: ['Accumulated change or signed area', 'Instantaneous slope', 'Highest point of a function', 'x-intercept count'],
          answer: 'Accumulated change or signed area',
          explanation: 'Definite integrals combine tiny contributions across an interval.',
          optionExplanations: {
            'Accumulated change or signed area': 'This captures the core interpretation of definite integration.',
            'Instantaneous slope': 'Instantaneous slope is modeled by derivatives, not integrals.',
            'Highest point of a function': 'Maximum values are optimization outcomes, not direct integral meaning.',
            'x-intercept count': 'Intercept count is unrelated to integral accumulation definition.'
          },
          tags: [...tags, 'integrals', 'interpretation'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which antiderivative of 6x is correct?',
          options: ['3x^2 + C', '6x + C', 'x^6 + C', '12x + C'],
          answer: '3x^2 + C',
          explanation: 'Differentiate candidate and verify it returns 6x.',
          optionExplanations: {
            '3x^2 + C': 'Derivative of 3x squared is exactly six x.',
            '6x + C': 'Derivative here is six, not six times x.',
            'x^6 + C': 'Derivative is six x to the fifth, which is far different.',
            '12x + C': 'Derivative is twelve, not six x.'
          },
          tags: [...tags, 'integrals'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'What does the second derivative f\"(x) indicate most directly?',
          options: ['Concavity or curvature trend', 'Function value itself', 'x-intercept location', 'Domain endpoints'],
          answer: 'Concavity or curvature trend',
          explanation: 'Second derivative tracks whether slope is increasing or decreasing.',
          optionExplanations: {
            'Concavity or curvature trend': 'Positive values suggest concave up and negative values suggest concave down.',
            'Function value itself': 'Function value comes from f(x), not the second derivative.',
            'x-intercept location': 'Intercepts are roots of f(x), not direct outputs of f double prime.',
            'Domain endpoints': 'Domain endpoints come from definition constraints, not curvature.'
          },
          tags: [...tags, 'derivatives', 'concavity'],
          difficulty: 4
        }),
        cards.conceptCheck({
          prompt: 'If velocity is positive but acceleration is negative, what is happening?',
          options: ['Moving forward and slowing down', 'Moving backward and speeding up', 'At rest with no forces', 'Moving forward and speeding up'],
          answer: 'Moving forward and slowing down',
          explanation: 'Velocity direction is forward, while opposite-sign acceleration reduces speed.',
          optionExplanations: {
            'Moving forward and slowing down': 'Positive velocity with negative acceleration means speed is decreasing in forward motion.',
            'Moving backward and speeding up': 'Backward motion needs negative velocity, which is not given.',
            'At rest with no forces': 'Positive velocity rules out being at rest.',
            'Moving forward and speeding up': 'Speeding up forward would require positive acceleration.'
          },
          tags: [...tags, 'motion', 'interpretation'],
          difficulty: 4
        })
      ]
    });
  }
};
