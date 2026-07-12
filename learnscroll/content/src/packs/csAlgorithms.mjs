import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'cs-algorithms-v1';
const CARD_PREFIX = 'cs_algorithms';

export const csAlgorithmsDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:computer-science', 'track:algorithms'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Computer Science Algorithms',
      topics: ['sorting', 'searching', 'graph traversal', 'asymptotic reasoning'],
      domain: 'computer-science',
      track: 'algorithms',
      stage: 'advanced',
      recommendedOrder: 3,
      prerequisites: ['cs-data-structures-v1'],
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'Which search algorithm requires sorted input to work efficiently?',
          answer: 'binary search',
          explanation: 'Binary search repeatedly halves the ordered search interval.',
          tags: [...tags, 'searching'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'Which traversal strategy uses a queue?',
          answer: 'breadth-first search',
          explanation: 'BFS processes nodes level by level using FIFO behavior.',
          tags: [...tags, 'graph-traversal'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What does DFS stand for?',
          answer: 'depth-first search',
          explanation: 'DFS explores one path deeply before backtracking.',
          tags: [...tags, 'graph-traversal'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What is a stable sorting algorithm?',
          answer: 'one that preserves relative order of equal keys',
          explanation: 'Stability matters when sorted keys carry secondary meaning.',
          tags: [...tags, 'sorting'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'How many comparisons in worst case for linear search on 8 items when target absent?',
          answer: '8',
          explanation: 'Linear search may inspect every element once.',
          tags: [...tags, 'searching', 'complexity'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'For binary search, interval size 32 becomes what after one comparison?',
          answer: '16',
          explanation: 'Binary search halves the remaining interval each step.',
          tags: [...tags, 'searching', 'complexity'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'If a sort is O(n log n), moving from n=1,000 to n=2,000 changes runtime by roughly:',
          answer: 'a bit more than double',
          explanation: 'n doubles and log n rises slightly, so growth is above 2x.',
          tags: [...tags, 'sorting', 'complexity'],
          difficulty: 3
        }),
        cards.quickMath({
          prompt: 'A graph has 7 vertices connected in a single line. Edges count is:',
          answer: '6',
          explanation: 'A path with v vertices has v - 1 edges.',
          tags: [...tags, 'graph-traversal'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Why is merge sort often preferred over bubble sort on large inputs?',
          options: ['Better asymptotic runtime', 'Needs no extra memory ever', 'Always simplest to implement', 'Never compares elements'],
          answer: 'Better asymptotic runtime',
          explanation: 'Merge sort is O(n log n) while bubble sort is O(n^2) in common use.',
          optionExplanations: {
            'Better asymptotic runtime': 'Lower growth rate makes merge sort scale better with large n.',
            'Needs no extra memory ever': 'Standard merge sort uses additional memory during merge steps.',
            'Always simplest to implement': 'Implementation simplicity depends on context and language.',
            'Never compares elements': 'Comparison sorting algorithms fundamentally compare keys.'
          },
          tags: [...tags, 'sorting', 'tradeoffs'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'What is the key idea behind dynamic programming?',
          options: ['Reuse solutions to overlapping subproblems', 'Search randomly until success', 'Only use recursion without memoization', 'Ignore base cases'],
          answer: 'Reuse solutions to overlapping subproblems',
          explanation: 'Memoization or tabulation avoids recomputing repeated work.',
          optionExplanations: {
            'Reuse solutions to overlapping subproblems': 'This captures the core optimization principle of dynamic programming.',
            'Search randomly until success': 'Random search does not exploit overlapping subproblem structure.',
            'Only use recursion without memoization': 'Without memoization, recursion may repeat expensive calculations.',
            'Ignore base cases': 'Base cases are essential for correctness and termination.'
          },
          tags: [...tags, 'algorithm-design'],
          difficulty: 4
        }),
        cards.conceptCheck({
          prompt: 'BFS is usually best for finding what in an unweighted graph?',
          options: ['Shortest path by edge count', 'Longest simple path', 'Minimum spanning tree weight in weighted graph', 'Topological sort in cyclic graph'],
          answer: 'Shortest path by edge count',
          explanation: 'BFS expands by distance layers from the source.',
          optionExplanations: {
            'Shortest path by edge count': 'Layered exploration guarantees first visit gives minimum edge distance.',
            'Longest simple path': 'Longest path is a different and much harder optimization problem.',
            'Minimum spanning tree weight in weighted graph': 'MST is solved by algorithms like Prim or Kruskal.',
            'Topological sort in cyclic graph': 'Topological sorting requires directed acyclic graphs.'
          },
          tags: [...tags, 'graph-traversal'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'What does it mean for an algorithm to be deterministic?',
          options: ['Same input yields same behavior and output', 'Uses no variables', 'Always runs in constant time', 'Never needs loops'],
          answer: 'Same input yields same behavior and output',
          explanation: 'Deterministic procedures have no randomness affecting execution path.',
          optionExplanations: {
            'Same input yields same behavior and output': 'This is the standard deterministic behavior definition.',
            'Uses no variables': 'Algorithms can use variables and still be deterministic.',
            'Always runs in constant time': 'Determinism is independent of time complexity class.',
            'Never needs loops': 'Loops are allowed in deterministic and nondeterministic styles alike.'
          },
          tags: [...tags, 'algorithm-design'],
          difficulty: 2
        })
      ]
    });
  }
};
