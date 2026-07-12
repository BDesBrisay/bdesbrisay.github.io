const experienceYears = new Date().getFullYear() - 2016;
const learningYears = new Date().getFullYear() - 2011;

export const GALLERY_CONFIG = {
  room: {
    width: 8,
    height: 4,
    segmentLength: 10,
  },

  poster: {
    width: 4.0,
    height: 3.2,
    depth: 0.06,
    centerY: 1.8,
    infoWall: 'left',
  },

  spawn: {
    x: 0,
    y: 1.65,
    z: 2,
    yaw: Math.PI,
  },

  movement: {
    speed: 4,
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
