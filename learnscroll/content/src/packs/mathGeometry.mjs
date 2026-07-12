import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'math-geometry-v1';
const CARD_PREFIX = 'math_geometry';

export const mathGeometryDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:math', 'track:geometry'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Math Geometry',
      topics: ['area', 'volume', 'angles', 'reasoning'],
      domain: 'math',
      track: 'geometry',
      stage: 'core',
      recommendedOrder: 3,
      prerequisites: ['math-arithmetic-v1'],
      createdAt,
      cards: [
        cards.quickMath({
          prompt: 'Find the area of a rectangle with length 12 and width 5.',
          answer: '60',
          explanation: 'Rectangle area equals length times width.',
          tags: [...tags, 'area'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'Find the perimeter of a square with side length 9.',
          answer: '36',
          explanation: 'Square perimeter is four times one side.',
          tags: [...tags, 'perimeter'],
          difficulty: 1
        }),
        cards.quickMath({
          prompt: 'A triangle has base 10 and height 6. Find its area.',
          answer: '30',
          explanation: 'Triangle area is one half of base times height.',
          tags: [...tags, 'area', 'triangles'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'Find the volume of a rectangular prism with dimensions 4, 3, and 7.',
          answer: '84',
          explanation: 'Multiply length, width, and height.',
          tags: [...tags, 'volume'],
          difficulty: 2
        }),
        cards.quickMath({
          prompt: 'If one angle in a linear pair is 68 degrees, what is the other angle?',
          answer: '112',
          explanation: 'Linear-pair angles sum to 180 degrees.',
          tags: [...tags, 'angles'],
          difficulty: 3
        }),
        cards.quickMath({
          prompt: 'The circumference of a circle is 31.4. Using pi = 3.14, find the diameter.',
          answer: '10',
          explanation: 'Use C = pi d and divide 31.4 by 3.14.',
          tags: [...tags, 'circles'],
          difficulty: 3
        }),
        cards.quickMath({
          prompt: 'A right triangle has legs 8 and 15. Find the hypotenuse.',
          answer: '17',
          explanation: 'Apply the Pythagorean theorem and simplify.',
          tags: [...tags, 'right-triangles', 'reasoning'],
          difficulty: 4
        }),
        cards.quickMath({
          prompt: 'Scale factor from a model to real object is 1:5. If model length is 7 cm, what is real length?',
          answer: '35 cm',
          explanation: 'Multiply model measure by the scale factor multiplier.',
          tags: [...tags, 'similarity'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which formula gives the area of a circle with radius r?',
          options: ['A = 2pi r', 'A = pi r^2', 'A = pi d', 'A = r^2 / 2'],
          answer: 'A = pi r^2',
          explanation: 'Circle area depends on radius squared.',
          optionExplanations: {
            'A = 2pi r': 'This is circumference, not area.',
            'A = pi r^2': 'This is the standard circle area relationship.',
            'A = pi d': 'This also represents circumference because d = 2r.',
            'A = r^2 / 2': 'This omits pi and does not match circle geometry.'
          },
          tags: [...tags, 'circles', 'formula-selection'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Two angles are complementary. If one is 37 degrees, the other is:',
          options: ['53 degrees', '143 degrees', '37 degrees', '90 degrees'],
          answer: '53 degrees',
          explanation: 'Complementary angles add to 90 degrees.',
          optionExplanations: {
            '53 degrees': 'Ninety minus thirty seven leaves fifty three.',
            '143 degrees': 'This is supplementary with 37, not complementary.',
            '37 degrees': 'Equal angles would total seventy four, not ninety.',
            '90 degrees': 'That would require the first angle to be zero.'
          },
          tags: [...tags, 'angles'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'A box has dimensions 2 x 3 x 4. Which value is its volume?',
          options: ['9', '10', '24', '48'],
          answer: '24',
          explanation: 'Volume of a rectangular prism is product of three dimensions.',
          optionExplanations: {
            '9': 'Nine is a two-dimensional total, not a 3D volume here.',
            '10': 'Adding dimensions does not produce volume.',
            '24': 'Two times three times four equals twenty four cubic units.',
            '48': 'This doubles the correct volume without geometric reason.'
          },
          tags: [...tags, 'volume', 'formula-selection'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'If a triangle has sides 3, 4, and 5, what type is it?',
          options: ['Right triangle', 'Equilateral triangle', 'Isosceles triangle', 'Obtuse triangle'],
          answer: 'Right triangle',
          explanation: 'A 3-4-5 side set satisfies the Pythagorean theorem.',
          optionExplanations: {
            'Right triangle': 'Three squared plus four squared equals five squared.',
            'Equilateral triangle': 'Equilateral triangles require all sides equal.',
            'Isosceles triangle': 'Isosceles triangles need at least two equal sides.',
            'Obtuse triangle': 'The 3-4-5 relationship is exactly right, not obtuse.'
          },
          tags: [...tags, 'right-triangles', 'reasoning'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'What does a scale factor of 1:2 mean for lengths?',
          options: ['New lengths are half the original', 'New lengths are double the original', 'Areas stay equal', 'Perimeters stay equal'],
          answer: 'New lengths are half the original',
          explanation: 'Each linear measure is multiplied by one half.',
          optionExplanations: {
            'New lengths are half the original': 'A one-to-two ratio means every segment shrinks by a factor of one half.',
            'New lengths are double the original': 'That would be scale factor two-to-one, not one-to-two.',
            'Areas stay equal': 'Areas change with the square of the scale factor.',
            'Perimeters stay equal': 'Perimeter scales with length and therefore also changes.'
          },
          tags: [...tags, 'similarity'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which statement is always true about the interior angles of a triangle?',
          options: ['They sum to 180 degrees', 'They sum to 360 degrees', 'Each angle is less than 60 degrees', 'Two angles must be equal'],
          answer: 'They sum to 180 degrees',
          explanation: 'Triangle interior angles always total a straight angle.',
          optionExplanations: {
            'They sum to 180 degrees': 'This is the universal interior-angle rule for triangles.',
            'They sum to 360 degrees': 'That sum applies to quadrilaterals, not triangles.',
            'Each angle is less than 60 degrees': 'Equilateral triangles have angles exactly sixty degrees.',
            'Two angles must be equal': 'Scalene triangles show all angles can be different.'
          },
          tags: [...tags, 'angles', 'reasoning'],
          difficulty: 2
        })
      ]
    });
  }
};
