import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'science-biology-v1';
const CARD_PREFIX = 'science_biology';

export const scienceBiologyDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:science', 'track:biology'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Science Biology',
      topics: ['cells', 'genetics', 'ecology', 'human systems'],
      domain: 'science',
      track: 'biology',
      stage: 'core',
      recommendedOrder: 3,
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'What organelle is known as the powerhouse of the cell?',
          answer: 'mitochondrion',
          explanation: 'Mitochondria are central sites for ATP production in eukaryotic cells.',
          tags: [...tags, 'cells'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What molecule carries genetic instructions in most organisms?',
          answer: 'DNA',
          explanation: 'DNA stores heritable information used for growth and function.',
          tags: [...tags, 'genetics'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What process makes glucose in plants using sunlight?',
          answer: 'photosynthesis',
          explanation: 'Photosynthesis captures light energy and stores it in chemical bonds.',
          tags: [...tags, 'plants', 'energy-flow'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'Which blood component primarily carries oxygen?',
          answer: 'red blood cells',
          explanation: 'Hemoglobin in red blood cells binds and transports oxygen.',
          tags: [...tags, 'human-systems'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What term describes a role of an organism in its ecosystem?',
          answer: 'niche',
          explanation: 'Niche includes resource use, behavior, and interactions in a habitat.',
          tags: [...tags, 'ecology'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What process produces body cells with identical chromosome counts?',
          answer: 'mitosis',
          explanation: 'Mitosis supports growth and tissue repair in multicellular organisms.',
          tags: [...tags, 'genetics', 'cell-division'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which structure controls movement of materials into and out of a cell?',
          options: ['Cell membrane', 'Nucleus', 'Ribosome', 'Chloroplast'],
          answer: 'Cell membrane',
          explanation: 'The membrane is selectively permeable and regulates transport.',
          optionExplanations: {
            'Cell membrane': 'This structure forms a controlled boundary for transport and signaling.',
            Nucleus: 'The nucleus stores DNA and directs activity but is not the outer transport gate.',
            Ribosome: 'Ribosomes build proteins rather than controlling boundary transport.',
            Chloroplast: 'Chloroplasts carry out photosynthesis in plants, not general membrane gating.'
          },
          tags: [...tags, 'cells'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'In a food chain, energy flow is best described as:',
          options: ['Sun -> producers -> consumers', 'Consumers -> sun -> producers', 'Only between consumers', 'Always recycled with no losses'],
          answer: 'Sun -> producers -> consumers',
          explanation: 'Energy enters mostly through producers and then moves through trophic levels.',
          optionExplanations: {
            'Sun -> producers -> consumers': 'This captures the primary directional flow of biological energy.',
            'Consumers -> sun -> producers': 'The sun is the external source, not a consumer output.',
            'Only between consumers': 'Producers are required to convert sunlight into usable chemical energy.',
            'Always recycled with no losses': 'Energy dissipates as heat; matter cycles more directly than energy.'
          },
          tags: [...tags, 'ecology', 'energy-flow'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'If two heterozygous parents (Aa x Aa) have offspring, chance of aa is:',
          options: ['25%', '50%', '75%', '100%'],
          answer: '25%',
          explanation: 'A Punnett square gives one aa outcome out of four total outcomes.',
          optionExplanations: {
            '25%': 'One of four genotype combinations is aa.',
            '50%': 'Half of offspring are expected heterozygous Aa, not homozygous recessive.',
            '75%': 'Seventy five percent is the expected dominant phenotype share, not aa genotype.',
            '100%': 'All offspring would only be aa if both parents were aa.'
          },
          tags: [...tags, 'genetics', 'inheritance'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'Which organ system primarily exchanges oxygen and carbon dioxide with the environment?',
          options: ['Respiratory system', 'Digestive system', 'Nervous system', 'Skeletal system'],
          answer: 'Respiratory system',
          explanation: 'Lungs and airways handle gas exchange across alveolar surfaces.',
          optionExplanations: {
            'Respiratory system': 'Gas exchange is the core function of respiratory organs.',
            'Digestive system': 'Digestion breaks down food and absorbs nutrients, not atmospheric gases.',
            'Nervous system': 'Nervous tissue coordinates signaling but does not directly exchange gases.',
            'Skeletal system': 'The skeleton supports structure and protection, not gas exchange.'
          },
          tags: [...tags, 'human-systems'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'What is the main role of enzymes in cells?',
          options: ['Speed up chemical reactions', 'Store genetic code', 'Transport oxygen in blood', 'Create sunlight'],
          answer: 'Speed up chemical reactions',
          explanation: 'Enzymes lower activation energy so reactions proceed efficiently.',
          optionExplanations: {
            'Speed up chemical reactions': 'Catalytic action is the defining role of enzymes.',
            'Store genetic code': 'Genetic code is stored primarily in DNA molecules.',
            'Transport oxygen in blood': 'Hemoglobin carries oxygen, not enzymes.',
            'Create sunlight': 'Sunlight is produced by stellar nuclear processes, not cellular enzymes.'
          },
          tags: [...tags, 'cells', 'metabolism'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'If a pollutant accumulates up a food chain, this is called:',
          options: ['biomagnification', 'photosynthesis', 'cell respiration', 'homeostasis'],
          answer: 'biomagnification',
          explanation: 'Toxin concentrations can increase at higher trophic levels.',
          optionExplanations: {
            biomagnification: 'This describes rising contaminant concentration across trophic levels.',
            photosynthesis: 'Photosynthesis converts light into chemical energy in producers.',
            'cell respiration': 'Cell respiration releases energy from nutrients within cells.',
            homeostasis: 'Homeostasis means maintaining stable internal conditions.'
          },
          tags: [...tags, 'ecology'],
          difficulty: 3
        })
      ]
    });
  }
};
