import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'cs-data-structures-v1';
const CARD_PREFIX = 'cs_data_structures';

export const csDataStructuresDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:computer-science', 'track:data-structures'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Computer Science Data Structures',
      topics: ['arrays', 'linked lists', 'stacks', 'queues', 'trees', 'maps'],
      domain: 'computer-science',
      track: 'data-structures',
      stage: 'core',
      recommendedOrder: 2,
      prerequisites: ['cs-foundations-v1'],
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'Which data structure follows Last-In, First-Out behavior?',
          answer: 'stack',
          explanation: 'Stacks remove the most recently added element first.',
          tags: [...tags, 'stacks'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'Which data structure follows First-In, First-Out behavior?',
          answer: 'queue',
          explanation: 'Queues remove elements in the same order they arrived.',
          tags: [...tags, 'queues'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What is the top node of a tree called?',
          answer: 'root',
          explanation: 'Tree traversal and hierarchy descriptions start from the root node.',
          tags: [...tags, 'trees'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What key operation does a hash map optimize?',
          answer: 'fast key-based lookup',
          explanation: 'Hashing enables average constant-time retrieval by key.',
          tags: [...tags, 'maps'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'An array has indices 0 through 9. How many elements does it contain?',
          answer: '10',
          explanation: 'Zero-based indexing means count is highest index plus one.',
          tags: [...tags, 'arrays'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'If push and pop on a stack are O(1), doubling operations from 1,000 to 2,000 changes work by:',
          answer: 'about double',
          explanation: 'Constant-time per operation keeps total work linear in number of operations.',
          tags: [...tags, 'stacks', 'complexity'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'In a binary tree where each node has at most 2 children, max nodes at level 3 (root level 0) is:',
          answer: '8',
          explanation: 'Each level can double, so level 3 has 2^3 nodes.',
          tags: [...tags, 'trees'],
          difficulty: 3
        }),
        cards.quickMath({
          prompt: 'A queue receives A, then B, then C. One dequeue returns:',
          answer: 'A',
          explanation: 'FIFO behavior removes the oldest item first.',
          tags: [...tags, 'queues'],
          difficulty: 1
        }),
        cards.conceptCheck({
          prompt: 'Which structure is usually best for fast random access by index?',
          options: ['Array', 'Linked list', 'Queue', 'Binary tree'],
          answer: 'Array',
          explanation: 'Arrays provide direct index-based addressing in contiguous memory.',
          optionExplanations: {
            Array: 'Arrays support efficient direct access to element i in constant time.',
            'Linked list': 'Linked lists require traversal from node to node for index-based access.',
            Queue: 'Queues are optimized for ordered insertion/removal, not random access.',
            'Binary tree': 'Trees optimize hierarchical search patterns, not index addressing.'
          },
          tags: [...tags, 'arrays', 'tradeoffs'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Why might a linked list be chosen over an array?',
          options: ['Frequent insertions/removals in the middle', 'Always faster random indexing', 'Less memory per node guaranteed', 'Built-in key hashing'],
          answer: 'Frequent insertions/removals in the middle',
          explanation: 'Lists can relink pointers without shifting many elements.',
          optionExplanations: {
            'Frequent insertions/removals in the middle': 'Pointer relinking can make middle updates cheaper than array shifts.',
            'Always faster random indexing': 'Indexing is typically slower in linked lists due to traversal.',
            'Less memory per node guaranteed': 'Linked lists often carry pointer overhead per node.',
            'Built-in key hashing': 'Hashing behavior belongs to hash-based map structures.'
          },
          tags: [...tags, 'linked-lists', 'tradeoffs'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which statement about hash collisions is true?',
          options: ['Different keys can map to same bucket', 'Collisions mean hash map is unusable', 'Collisions cannot happen with good hash functions', 'Collisions only occur in trees'],
          answer: 'Different keys can map to same bucket',
          explanation: 'Finite buckets force occasional collisions that must be handled.',
          optionExplanations: {
            'Different keys can map to same bucket': 'Collision handling strategies like chaining resolve this expected case.',
            'Collisions mean hash map is unusable': 'Hash maps are designed to operate correctly despite collisions.',
            'Collisions cannot happen with good hash functions': 'Good hash functions reduce collisions but cannot eliminate them fully.',
            'Collisions only occur in trees': 'Collisions are hash table events, not tree-specific behavior.'
          },
          tags: [...tags, 'maps'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which traversal visits root, then left subtree, then right subtree?',
          options: ['Preorder', 'Inorder', 'Postorder', 'Level order only'],
          answer: 'Preorder',
          explanation: 'Preorder processing handles node before recursive children.',
          optionExplanations: {
            Preorder: 'Preorder order is root-left-right by definition.',
            Inorder: 'Inorder order for binary trees is left-root-right.',
            Postorder: 'Postorder processes children before the root node.',
            'Level order only': 'Level order is breadth-first and distinct from preorder recursion.'
          },
          tags: [...tags, 'trees'],
          difficulty: 3
        })
      ]
    });
  }
};
