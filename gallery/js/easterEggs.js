import { surfaceDistance, surfacePosition } from './planet.js';

export const EASTER_EGGS = [
  {
    id: 'fact-coding',
    lat: 0.1,
    lon: 2.4,
    type: 'fact',
    title: 'Fun Fact',
    body: 'First learned to code in 5th grade — still at it.',
  },
  {
    id: 'fact-bay',
    lat: -0.35,
    lon: 0.6,
    type: 'fact',
    title: 'Home Base',
    body: 'Remote developer based in the SF Bay Area.',
  },
  {
    id: 'link-github',
    lat: 0.55,
    lon: 2.8,
    type: 'link',
    title: 'GitHub',
    body: 'More code lives here.',
    url: 'https://www.github.com/bdesbrisay',
  },
  {
    id: 'link-linkedin',
    lat: -0.25,
    lon: 3.2,
    type: 'link',
    title: 'LinkedIn',
    body: 'Connect on LinkedIn.',
    url: 'https://www.linkedin.com/in/bryce-desbrisay-b36818108/',
  },
  {
    id: 'joke-road',
    lat: 0.3,
    lon: 1.2,
    type: 'joke',
    title: 'Sign',
    body: 'Road not maintained by InspectMind.AI.',
  },
  {
    id: 'joke-speed',
    lat: -0.1,
    lon: 4.5,
    type: 'joke',
    title: 'Speed Limit',
    body: 'Arcade physics — please drive responsibly on Planet Bryce.',
  },
  {
    id: 'fact-startups',
    lat: 0.6,
    lon: 0.9,
    type: 'fact',
    title: 'Startups',
    body: 'Worked on many startups — UI/UX, graphics, and full frontend builds.',
  },
  {
    id: 'link-contact',
    lat: -0.4,
    lon: 2.1,
    type: 'link',
    title: 'Contact',
    body: 'Want to chat? Send a message.',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSd4W-KoHfJJ1VwsNyBj380TZw-xtKdOA7IvnRpelT2bkZcOVg/viewform?usp=sf_link',
  },
];

export function buildEasterEggList() {
  return EASTER_EGGS;
}

export function getNearestEgg(position, eggs, config, threshold = 4) {
  let best = null;
  let bestDist = Infinity;

  for (const egg of eggs) {
    const p = surfacePosition(egg.lat, egg.lon, config, 0);
    const eggPos = { x: p.x, y: p.y, z: p.z };
    const dist = surfaceDistance(position, eggPos, config);
    if (dist < threshold && dist < bestDist) {
      bestDist = dist;
      best = egg;
    }
  }

  return best ? { egg: best, distance: bestDist } : null;
}
