import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'science-chemistry-v1';
const CARD_PREFIX = 'science_chemistry';

export const scienceChemistryDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:science', 'track:chemistry'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Science Chemistry',
      topics: ['atoms', 'bonding', 'reactions', 'stoichiometry'],
      domain: 'science',
      track: 'chemistry',
      stage: 'core',
      recommendedOrder: 2,
      prerequisites: ['science-physics-v1'],
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'What subatomic particle has a positive charge?',
          answer: 'proton',
          explanation: 'Protons in the nucleus determine an element atomic number.',
          tags: [...tags, 'atoms'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What pH value is neutral at room temperature?',
          answer: '7',
          explanation: 'Values below seven are acidic and above seven are basic.',
          tags: [...tags, 'acids-bases'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What does H2O represent?',
          answer: 'water molecule',
          explanation: 'Two hydrogen atoms bonded to one oxygen atom form water.',
          tags: [...tags, 'formulas'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What kind of bond forms when electrons are transferred?',
          answer: 'ionic bond',
          explanation: 'Electron transfer creates oppositely charged ions that attract.',
          tags: [...tags, 'bonding'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What is the molar mass unit commonly used in chemistry?',
          answer: 'grams per mole',
          explanation: 'Stoichiometry often converts between moles and grams with this unit.',
          tags: [...tags, 'stoichiometry'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What gas is typically produced when acids react with many metals?',
          answer: 'hydrogen gas',
          explanation: 'A common pattern is acid + metal yielding salt and hydrogen gas.',
          tags: [...tags, 'reactions'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which statement best describes a covalent bond?',
          options: ['Atoms share electrons', 'Atoms transfer protons', 'Atoms share neutrons', 'Atoms become neutral by removing all electrons'],
          answer: 'Atoms share electrons',
          explanation: 'Covalent bonding is built on shared electron pairs.',
          optionExplanations: {
            'Atoms share electrons': 'This is the defining mechanism of covalent bonds.',
            'Atoms transfer protons': 'Protons stay in nuclei and are not transferred in ordinary bonding.',
            'Atoms share neutrons': 'Neutrons do not participate in bonding interactions.',
            'Atoms become neutral by removing all electrons': 'Removing all electrons forms bare nuclei, not bonded molecules.'
          },
          tags: [...tags, 'bonding'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'If a solution has pH 3, it is:',
          options: ['acidic', 'basic', 'neutral', 'always nonreactive'],
          answer: 'acidic',
          explanation: 'pH values below 7 indicate acidic solutions.',
          optionExplanations: {
            acidic: 'This is correct because pH three is well below neutral seven.',
            basic: 'Basic solutions have pH above seven.',
            neutral: 'Neutral is pH seven, not pH three.',
            'always nonreactive': 'Acid strength and reactivity vary; low pH does not mean nonreactive.'
          },
          tags: [...tags, 'acids-bases'],
          difficulty: 1
        }),
        cards.conceptCheck({
          prompt: 'Balanced equation check: 2H2 + O2 -> 2H2O is balanced because:',
          options: ['Each element has equal atom counts on both sides', 'Only oxygen is balanced', 'Water has no atoms', 'Coefficients are all one'],
          answer: 'Each element has equal atom counts on both sides',
          explanation: 'Balancing tracks atom conservation for every element.',
          optionExplanations: {
            'Each element has equal atom counts on both sides': 'Hydrogen and oxygen atom totals match before and after reaction.',
            'Only oxygen is balanced': 'Hydrogen is also balanced in this equation.',
            'Water has no atoms': 'Molecules are composed of atoms by definition.',
            'Coefficients are all one': 'Coefficients are not all one in this balanced equation.'
          },
          tags: [...tags, 'reactions', 'balancing'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'How many moles are in 36 grams of water (molar mass 18 g/mol)?',
          options: ['2 mol', '18 mol', '0.5 mol', '54 mol'],
          answer: '2 mol',
          explanation: 'Moles equal mass divided by molar mass: 36 / 18.',
          optionExplanations: {
            '2 mol': 'Dividing thirty six by eighteen yields exactly two moles.',
            '18 mol': 'This flips the operation and overestimates by a factor of nine.',
            '0.5 mol': 'Half mole would correspond to nine grams, not thirty six.',
            '54 mol': 'This applies multiplication rather than required division.'
          },
          tags: [...tags, 'stoichiometry'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which change is evidence of a chemical reaction?',
          options: ['Formation of a new gas', 'Melting ice', 'Cutting paper', 'Boiling water'],
          answer: 'Formation of a new gas',
          explanation: 'Gas production can indicate new substances formed through reaction.',
          optionExplanations: {
            'Formation of a new gas': 'Bubbling from gas generation is a common reaction indicator.',
            'Melting ice': 'This is a physical state change with the same substance.',
            'Cutting paper': 'Shape changes do not create new substances.',
            'Boiling water': 'Boiling is physical phase change, not chemical transformation.'
          },
          tags: [...tags, 'reactions'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which particle arrangement best describes a solid?',
          options: ['Tightly packed with fixed positions', 'Widely separated random particles only', 'No particles present', 'Particles always moving faster than in gases'],
          answer: 'Tightly packed with fixed positions',
          explanation: 'Solids have closely packed particles that vibrate around fixed points.',
          optionExplanations: {
            'Tightly packed with fixed positions': 'This matches typical solid-state particle structure.',
            'Widely separated random particles only': 'That pattern is more characteristic of gases.',
            'No particles present': 'Matter in any state is made of particles.',
            'Particles always moving faster than in gases': 'Gas particles generally move faster than solid particles.'
          },
          tags: [...tags, 'matter-model'],
          difficulty: 2
        })
      ]
    });
  }
};
