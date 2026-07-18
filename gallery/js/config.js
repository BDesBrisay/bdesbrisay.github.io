const experienceYears = new Date().getFullYear() - 2016;
const learningYears = new Date().getFullYear() - 2011;

export const GALLERY_CONFIG = {
  planet: {
    radius: 28,
    segments: 96,
    baseColor: '#4a6741',
    dirtColor: '#6b5344',
    waterColor: '#2a5a7a',
    roadColor: '#b8b4a4',
    roadEdgeColor: '#6b6560',
    roadCenterColor: '#e8e4d8',
    roadWidth: 2.0,
    roadRaise: 0.28,
    heightAmplitude: 0.9,
    lakeLat: -0.15,
    lakeLon: 1.8,
    lakeRadius: 2.5,
    fogDensity: 0.005,
  },

  sky: {
    nebulaColors: ['#1a0a2e', '#3d1a6e', '#0d1b3e'],
    auroraColors: ['#00ffaa44', '#aa00ff33'],
  },

  drive: {
    maxSpeed: 11,
    acceleration: 22,
    brakeDecel: 28,
    turnRate: 2.5,
    carHover: 0.35,
    cameraDistance: 4,
    cameraHeight: 1.6,
    cameraLag: 8,
  },

  area: {
    zoneRadius: 3,
    revealRadius: 4.5,
    tourLatStart: 0.44,
    tourLonStep: 0.38,
    tourLatDrift: 0.025,
  },

  nav: {
    compassSize: 48,
    minimapSize: 140,
    minimapZoom: 0.55,
  },

  landmark: {
    archWidth: 4.4,
    archHeight: 3.5,
    pillarWidth: 0.25,
    labelHeight: 0.6,
  },

  intro: {
    tutorialStorageKey: 'gallery-planet-tutorial-seen',
  },

  movement: {
    lookSensitivity: 0.002,
  },

  placement: {
    hidden: [],
    order: null,
  },
};

export const PROFILE_EXHIBIT = {
  type: 'profile',
  id: 'profile',
  image: '../images/bryceProfile3.jpg',
  title: 'Bryce DesBrisay',
  position: 'Fullstack Developer & Designer',
  location: 'Remote, based in the SF Bay Area',
  description:
    `I've worked on many startups before and have experience developing products from the ground up. ` +
    `My role in almost all of the projects I've worked on has been to mock the UI/UX of the product, ` +
    `design the graphics, logos, and layouts for both the website and mobile applications, then finally ` +
    `code the entire frontend interface (typically with React.js/React Native & GraphQL). ` +
    `I have over ${experienceYears} years of professional web development experience. I first learned ` +
    `to code in 5th grade and have been working on side projects and startups ever since ` +
    `(about ${learningYears} years of learning!).`,
  links: [
    { label: 'Github', url: 'https://www.github.com/bdesbrisay' },
    { label: 'Linkedin', url: 'https://www.linkedin.com/in/bryce-desbrisay-b36818108/' },
    { label: 'Contact Me', url: 'https://docs.google.com/forms/d/e/1FAIpQLSd4W-KoHfJJ1VwsNyBj380TZw-xtKdOA7IvnRpelT2bkZcOVg/viewform?usp=sf_link' },
  ],
  colors: { background: '#4a6fa5', primary: '#026cff' },
};
