import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'science-physics-v1';
const CARD_PREFIX = 'science_physics';

export const sciencePhysicsDefinition = {
  packId: PACK_ID,
  defaultInstall: true,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:science', 'track:physics'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Science Physics',
      topics: ['mechanics', 'energy', 'waves', 'electricity'],
      domain: 'science',
      track: 'physics',
      stage: 'foundation',
      recommendedOrder: 1,
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'What is the SI unit of force?',
          answer: 'newton',
          explanation: 'Force in equations like F = ma is measured in newtons.',
          tags: [...tags, 'units'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What is the SI unit of electric current?',
          answer: 'ampere',
          explanation: 'Current measures charge flow per second in amperes.',
          tags: [...tags, 'electricity', 'units'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What kind of wave is light?',
          answer: 'electromagnetic wave',
          explanation: 'Light can travel through vacuum without a material medium.',
          tags: [...tags, 'waves'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What does conservation of energy state in a closed system?',
          answer: 'total energy stays constant',
          explanation: 'Energy can transform forms, but the total amount is conserved.',
          tags: [...tags, 'energy'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What law relates voltage, current, and resistance?',
          answer: 'Ohm law',
          explanation: 'The common relationship is V = I R for simple circuits.',
          tags: [...tags, 'electricity'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What quantity is mass times acceleration?',
          answer: 'net force',
          explanation: 'Newton second law models this as F = ma.',
          tags: [...tags, 'mechanics'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'When net force on an object is zero, which motion is possible?',
          options: ['Constant velocity', 'Only accelerating motion', 'Immediate stop', 'Instant direction reversal'],
          answer: 'Constant velocity',
          explanation: 'Zero net force means zero acceleration, so velocity can remain unchanged.',
          optionExplanations: {
            'Constant velocity': 'This matches Newton first law when no net force acts.',
            'Only accelerating motion': 'Acceleration requires a nonzero net force.',
            'Immediate stop': 'Stopping is not required; constant motion is also possible.',
            'Instant direction reversal': 'Direction change implies acceleration and thus nonzero net force.'
          },
          tags: [...tags, 'mechanics'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'If wave speed in a medium stays constant and wavelength decreases, frequency:',
          options: ['increases', 'decreases', 'stays identical', 'becomes zero'],
          answer: 'increases',
          explanation: 'Speed equals frequency times wavelength, so shorter wavelength means higher frequency.',
          optionExplanations: {
            increases: 'With constant speed, frequency must rise when wavelength shrinks.',
            decreases: 'Frequency and wavelength move inversely in the same medium.',
            'stays identical': 'Keeping frequency fixed would keep wavelength fixed at constant speed.',
            'becomes zero': 'Zero frequency would imply no oscillation, not a shorter wavelength wave.'
          },
          tags: [...tags, 'waves'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'A 2 kg object accelerates at 3 m/s^2. Net force is:',
          options: ['6 N', '1.5 N', '5 N', '9 N'],
          answer: '6 N',
          explanation: 'Multiply mass by acceleration using F = ma.',
          optionExplanations: {
            '6 N': 'Two times three gives six newtons.',
            '1.5 N': 'This would come from division, not the F = ma relation.',
            '5 N': 'Five is close but does not match the exact product.',
            '9 N': 'Nine would require either larger mass or larger acceleration.'
          },
          tags: [...tags, 'mechanics', 'numerical-reasoning'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'A bulb on a simple circuit gets dimmer when resistance increases because current:',
          options: ['decreases', 'increases', 'stays fixed', 'changes into mass'],
          answer: 'decreases',
          explanation: 'At fixed voltage, larger resistance lowers current by Ohm law.',
          optionExplanations: {
            decreases: 'Current drops when resistance rises for the same voltage source.',
            increases: 'This is opposite of Ohm law behavior.',
            'stays fixed': 'Current only stays fixed if voltage and resistance ratio stays fixed.',
            'changes into mass': 'Electrical current is charge flow and does not convert into mass here.'
          },
          tags: [...tags, 'electricity'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which statement best defines kinetic energy?',
          options: ['Energy of motion', 'Stored chemical bond energy', 'Energy from position only', 'Energy in atomic nuclei only'],
          answer: 'Energy of motion',
          explanation: 'Kinetic energy is associated with object speed.',
          optionExplanations: {
            'Energy of motion': 'Kinetic energy increases with mass and the square of speed.',
            'Stored chemical bond energy': 'That describes chemical potential energy forms.',
            'Energy from position only': 'Position-based energy is potential, not kinetic.',
            'Energy in atomic nuclei only': 'Nuclear energy is a separate category.'
          },
          tags: [...tags, 'energy'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Why do astronauts feel weightless in orbit?',
          options: ['They and spacecraft are in continuous free fall', 'There is no gravity near Earth orbit', 'Their mass becomes zero', 'Air pressure exactly cancels gravity'],
          answer: 'They and spacecraft are in continuous free fall',
          explanation: 'Gravity still acts strongly, but shared free-fall removes support force sensation.',
          optionExplanations: {
            'They and spacecraft are in continuous free fall': 'Both accelerate together under gravity, creating apparent weightlessness.',
            'There is no gravity near Earth orbit': 'Earth gravity remains strong enough to maintain orbital motion.',
            'Their mass becomes zero': 'Mass does not disappear in orbit.',
            'Air pressure exactly cancels gravity': 'Orbit occurs above most atmosphere and is not pressure-balanced.'
          },
          tags: [...tags, 'mechanics', 'orbital-motion'],
          difficulty: 3
        })
      ]
    });
  }
};
