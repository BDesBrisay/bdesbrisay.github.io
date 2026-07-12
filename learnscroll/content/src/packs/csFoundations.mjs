import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'cs-foundations-v1';
const CARD_PREFIX = 'cs_foundations';

export const csFoundationsDefinition = {
  packId: PACK_ID,
  defaultInstall: true,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:computer-science', 'track:foundations'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Computer Science Foundations',
      topics: ['logic', 'binary', 'data representation', 'complexity intuition'],
      domain: 'computer-science',
      track: 'foundations',
      stage: 'foundation',
      recommendedOrder: 1,
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'How many values can a single bit represent?',
          answer: '2',
          explanation: 'A bit has two states, commonly written as 0 and 1.',
          tags: [...tags, 'binary'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What does CPU stand for?',
          answer: 'central processing unit',
          explanation: 'The CPU executes instructions and coordinates core computation.',
          tags: [...tags, 'computer-basics'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What number system uses base 2?',
          answer: 'binary',
          explanation: 'Binary uses place values that are powers of two.',
          tags: [...tags, 'binary'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What does algorithm mean in computing?',
          answer: 'step-by-step procedure',
          explanation: 'Algorithms describe finite ordered steps for solving a problem.',
          tags: [...tags, 'algorithms-basics'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'Convert binary 1011 to decimal.',
          answer: '11',
          explanation: 'Add place values: 8 + 2 + 1.',
          tags: [...tags, 'binary', 'conversions'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'How many bits are in one byte?',
          answer: '8',
          explanation: 'A byte is defined as eight contiguous bits.',
          tags: [...tags, 'data-representation'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'Which grows faster as n increases: n or n^2?',
          answer: 'n^2',
          explanation: 'Quadratic growth outpaces linear growth for large n.',
          tags: [...tags, 'complexity-intuition'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'If an algorithm takes about 2n steps and n doubles, total steps roughly become:',
          answer: 'double',
          explanation: 'Linear-time work scales proportionally with n.',
          tags: [...tags, 'complexity-intuition'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which statement about Boolean logic is correct?',
          options: ['AND is true only when both inputs are true', 'AND is true when either input is true', 'OR is true only when both inputs are true', 'NOT keeps value unchanged'],
          answer: 'AND is true only when both inputs are true',
          explanation: 'AND requires both conditions to hold simultaneously.',
          optionExplanations: {
            'AND is true only when both inputs are true': 'This is the correct truth condition for logical AND.',
            'AND is true when either input is true': 'That describes OR, not AND.',
            'OR is true only when both inputs are true': 'OR is true when at least one input is true.',
            'NOT keeps value unchanged': 'NOT flips true to false and false to true.'
          },
          tags: [...tags, 'logic'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Why is Big-O notation useful?',
          options: ['It compares growth rates as input size changes', 'It gives exact runtime on every computer', 'It replaces testing entirely', 'It guarantees code has no bugs'],
          answer: 'It compares growth rates as input size changes',
          explanation: 'Big-O abstracts machine details to reason about scalability.',
          optionExplanations: {
            'It compares growth rates as input size changes': 'This is the core role of asymptotic complexity notation.',
            'It gives exact runtime on every computer': 'Actual runtime also depends on constants, hardware, and implementation.',
            'It replaces testing entirely': 'Complexity analysis and testing solve different verification needs.',
            'It guarantees code has no bugs': 'Complexity says nothing about functional correctness alone.'
          },
          tags: [...tags, 'complexity-intuition'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'What is a variable in programming?',
          options: ['Named storage for a value', 'A fixed hardware chip', 'A network cable type', 'A compiler error'],
          answer: 'Named storage for a value',
          explanation: 'Variables let programs reference and update data by name.',
          optionExplanations: {
            'Named storage for a value': 'Variables bind a name to a value in memory or scope.',
            'A fixed hardware chip': 'Hardware chips are physical components, not programming variables.',
            'A network cable type': 'Cable types are networking infrastructure terms.',
            'A compiler error': 'Errors are diagnostics, not data containers.'
          },
          tags: [...tags, 'programming-basics'],
          difficulty: 1
        }),
        cards.conceptCheck({
          prompt: 'If an algorithm is O(log n), increasing n from 1,000 to 1,000,000 usually causes steps to:',
          options: ['Increase modestly', 'Increase one thousand times', 'Stay exactly constant', 'Decrease to zero'],
          answer: 'Increase modestly',
          explanation: 'Logarithmic growth rises slowly even as input sizes jump drastically.',
          optionExplanations: {
            'Increase modestly': 'Logarithms grow slowly, making large input increases relatively cheap.',
            'Increase one thousand times': 'That behavior is closer to linear scaling.',
            'Stay exactly constant': 'Step counts still increase, just gradually.',
            'Decrease to zero': 'No practical input increase causes work to drop to zero by itself.'
          },
          tags: [...tags, 'complexity-intuition'],
          difficulty: 3
        })
      ]
    });
  }
};
