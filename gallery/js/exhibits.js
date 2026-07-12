import { resolveImagePath } from './utils.js';

/**
 * @typedef {Object} Exhibit
 * @property {'profile'|'project'} type
 * @property {string} id
 * @property {string} [image]
 * @property {string} title
 * @property {string} [position]
 * @property {string} [dates]
 * @property {string} [location]
 * @property {string} [description]
 * @property {Array<{label:string, url:string}>} [links]
 * @property {Array<{title:string, type:string}>} [tags]
 * @property {{background:string, primary:string}} colors
 * @property {boolean} [titleIsHtml]
 */

/**
 * @typedef {Object} RoomSegment
 * @property {string} exhibitId
 * @property {number} zStart
 * @property {number} zEnd
 * @property {{background:string, primary:string}} colors
 */

const DEFAULT_COLORS = { background: '#345', primary: '#4a90e2' };

function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '');
}

function isHtmlTitle(title) {
  return typeof title === 'string' && title.includes('<');
}

export function projectToExhibit(project) {
  const hasHtmlTitle = isHtmlTitle(project.title);

  return {
    type: 'project',
    id: project.id,
    image: project.image ? resolveImagePath(project.image) : undefined,
    title: hasHtmlTitle ? stripHtmlTags(project.title) : project.title,
    titleIsHtml: hasHtmlTitle || undefined,
    position: project.position,
    dates: project.dates,
    description: project.description,
    links: (project.links || []).map(l => ({ label: l.label, url: l.link })),
    tags: project.tags || [],
    colors: project.colors || DEFAULT_COLORS,
  };
}

export function buildExhibits(projects, profileExhibit, config) {
  const hidden = new Set(config.placement.hidden);
  const ordered = config.placement.order || projects.map(p => p.id);
  const projectMap = new Map(projects.map(p => [p.id, p]));

  const projectExhibits = ordered
    .filter(id => !hidden.has(id) && projectMap.has(id))
    .map(id => projectToExhibit(projectMap.get(id)));

  return [profileExhibit, ...projectExhibits];
}

export function resolveRooms(exhibits, config) {
  const segLen = config.room.segmentLength;
  const rooms = exhibits.map((exhibit, i) => ({
    exhibitId: exhibit.id,
    zStart: i * segLen,
    zEnd: (i + 1) * segLen,
    colors: exhibit.colors,
  }));
  const corridorDepth = exhibits.length * segLen;
  return { rooms, corridorDepth };
}
