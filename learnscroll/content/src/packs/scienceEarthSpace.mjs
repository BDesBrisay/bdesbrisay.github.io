import { createCardFactory, createPack } from '../builders.mjs';

const PACK_ID = 'science-earth-space-v1';
const CARD_PREFIX = 'science_earth_space';

export const scienceEarthSpaceDefinition = {
  packId: PACK_ID,
  defaultInstall: false,
  buildPack: ({ createdAt }) => {
    const cards = createCardFactory(PACK_ID, CARD_PREFIX);
    const tags = ['domain:science', 'track:earth-space'];

    return createPack({
      packId: PACK_ID,
      version: '1.0.0',
      title: 'Science Earth and Space',
      topics: ['geology', 'climate', 'weather', 'astronomy'],
      domain: 'science',
      track: 'earth-space',
      stage: 'core',
      recommendedOrder: 4,
      prerequisites: ['science-physics-v1'],
      createdAt,
      cards: [
        cards.flashFact({
          prompt: 'What is the most abundant gas in Earth atmosphere?',
          answer: 'nitrogen',
          explanation: 'Nitrogen makes up about seventy eight percent of dry air.',
          tags: [...tags, 'atmosphere'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What layer of Earth is liquid and surrounds the inner core?',
          answer: 'outer core',
          explanation: 'The outer core is mostly molten iron and nickel.',
          tags: [...tags, 'geology'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What causes ocean tides primarily on Earth?',
          answer: 'gravitational pull of the Moon',
          explanation: 'Lunar gravity produces dominant tidal bulges on Earth oceans.',
          tags: [...tags, 'astronomy', 'earth-systems'],
          difficulty: 2
        }),
        cards.flashFact({
          prompt: 'What is the boundary where two tectonic plates meet called?',
          answer: 'plate boundary',
          explanation: 'Earthquakes and volcanism often cluster at plate boundaries.',
          tags: [...tags, 'geology', 'tectonics'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What instrument measures atmospheric pressure?',
          answer: 'barometer',
          explanation: 'Pressure trends help forecast approaching weather systems.',
          tags: [...tags, 'weather'],
          difficulty: 1
        }),
        cards.flashFact({
          prompt: 'What type of star is the Sun?',
          answer: 'main-sequence star',
          explanation: 'The Sun is currently in the stable hydrogen-fusion stage.',
          tags: [...tags, 'astronomy'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Why do seasons occur on Earth?',
          options: ['Earth axis is tilted', 'Earth gets much closer to the Sun in summer', 'Moon blocks sunlight in winter', 'Sun outputs far less energy every winter'],
          answer: 'Earth axis is tilted',
          explanation: 'Axial tilt changes sunlight angle and day length through the year.',
          optionExplanations: {
            'Earth axis is tilted': 'Tilt is the core reason seasonal sunlight patterns change.',
            'Earth gets much closer to the Sun in summer': 'Distance changes are small and not aligned with hemisphere seasons.',
            'Moon blocks sunlight in winter': 'Moon phases and eclipses do not drive seasonal climate cycles.',
            'Sun outputs far less energy every winter': 'Solar output is comparatively stable across seasonal timescales.'
          },
          tags: [...tags, 'climate', 'astronomy'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'At a convergent plate boundary, what often happens?',
          options: ['Mountains form and quakes occur', 'New ocean crust forms at a rift', 'No geologic activity occurs', 'Only weather changes'],
          answer: 'Mountains form and quakes occur',
          explanation: 'Plate collision can uplift crust and produce significant seismic activity.',
          optionExplanations: {
            'Mountains form and quakes occur': 'Compression from collision commonly creates uplift and faulting.',
            'New ocean crust forms at a rift': 'That describes divergent boundaries, not convergent ones.',
            'No geologic activity occurs': 'Convergent zones are among the most active geologic regions.',
            'Only weather changes': 'Weather can vary anywhere, but boundary type refers to crustal dynamics.'
          },
          tags: [...tags, 'geology', 'tectonics'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'If warm air rises and cools, what is a likely result?',
          options: ['Cloud formation', 'Immediate ozone depletion', 'Earth magnetic reversal', 'Tidal locking'],
          answer: 'Cloud formation',
          explanation: 'Cooling rising air can reach dew point and condense water vapor.',
          optionExplanations: {
            'Cloud formation': 'Condensation from cooling moist air produces cloud droplets.',
            'Immediate ozone depletion': 'Ozone chemistry is not a direct immediate result of local uplift.',
            'Earth magnetic reversal': 'Geomagnetic reversals occur over long geologic timescales.',
            'Tidal locking': 'Tidal locking is an orbital mechanics process, not short-term weather.'
          },
          tags: [...tags, 'weather'],
          difficulty: 2
        }),
        cards.conceptCheck({
          prompt: 'Which planet is known for a prominent ring system?',
          options: ['Saturn', 'Mars', 'Mercury', 'Venus'],
          answer: 'Saturn',
          explanation: 'Saturn ring system is visually extensive and highly reflective.',
          optionExplanations: {
            Saturn: 'Saturn has the most prominent ring structure in our solar system.',
            Mars: 'Mars has no large bright ring system.',
            Mercury: 'Mercury is a small rocky planet without rings.',
            Venus: 'Venus has thick atmosphere but no ring system.'
          },
          tags: [...tags, 'astronomy'],
          difficulty: 1
        }),
        cards.conceptCheck({
          prompt: 'Which process removes carbon dioxide from the atmosphere most directly?',
          options: ['Photosynthesis by plants', 'Combustion of fossil fuels', 'Volcanic outgassing', 'Cement production'],
          answer: 'Photosynthesis by plants',
          explanation: 'Photosynthesis incorporates atmospheric carbon into biomass.',
          optionExplanations: {
            'Photosynthesis by plants': 'Plants use carbon dioxide to produce sugars and release oxygen.',
            'Combustion of fossil fuels': 'Combustion releases additional carbon dioxide rather than removing it.',
            'Volcanic outgassing': 'Volcanism generally emits carbon-containing gases.',
            'Cement production': 'Cement manufacturing is a significant carbon dioxide source.'
          },
          tags: [...tags, 'climate', 'carbon-cycle'],
          difficulty: 3
        }),
        cards.conceptCheck({
          prompt: 'What distinguishes weather from climate?',
          options: ['Weather is short-term; climate is long-term pattern', 'Weather is global only; climate is local only', 'Weather happens in oceans only', 'Climate changes hourly only'],
          answer: 'Weather is short-term; climate is long-term pattern',
          explanation: 'Weather captures immediate conditions while climate summarizes long periods.',
          optionExplanations: {
            'Weather is short-term; climate is long-term pattern': 'This captures the key timescale difference between the two terms.',
            'Weather is global only; climate is local only': 'Both can be described at local, regional, or global scales.',
            'Weather happens in oceans only': 'Weather occurs in the atmosphere over land and water.',
            'Climate changes hourly only': 'Climate is evaluated over years to decades, not hour-to-hour shifts.'
          },
          tags: [...tags, 'climate', 'weather'],
          difficulty: 2
        })
      ]
    });
  }
};
