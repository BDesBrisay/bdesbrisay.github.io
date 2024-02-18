/**
 * Aggregate all the tags from the projects
 */
const tagsMap = PROJECTS.reduce((obj, project) => {
  project.tags.forEach((tag) => {
    if (!obj[tag.title]) obj[tag.title] = tag.type
  })
  return obj
}, {})

let activeTags = [];

/**
 * Initialize the page
 */
function init() {
  // update active tags
  const urlHash = window.location.hash;
  activeTags = decodeURIComponent(urlHash).split('#').slice(1);

  // Load projects
  loadProjects();

  // Update dynamic dates
  // updateDates();

  // handle scroll events
  window.addEventListener('scroll', handleScroll);
}

/**
 * Toggle a tag
 * @param {string} tag
 */
function toggleTag(tag) {
  const loc = window.location;
  if (activeTags.includes(tag)) activeTags = activeTags.filter((i) => i !== tag);
  else activeTags = [...activeTags, tag];

  const extention = activeTags.length ? activeTags.map((tag) => `#${tag}`).join('') : '';
  window.location = loc.origin + loc.pathname + extention;

  clearProjects();
  loadProjects();
}

/**
 * Handle scroll events
 */
function handleScroll() {
  console.log('scrolling');
  const sections = document.querySelectorAll('.project');
  const scrollY = window.pageYOffset;

  sections.forEach((section) => {
    const sectionId = section.getAttribute('id');
    const offset = window.innerHeight / 2;
    const sectionTop = section.offsetTop - offset;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollY > sectionTop && scrollY <= sectionBottom) {
      const colors = getColorForSection(sectionId);
      
      // change the body::before background color
      document.body.style.setProperty('--background-tint', colors.primary);
    }
  });
}

/**
 * Get color for a section
 */
function getColorForSection(sectionId) {
  // from projects
  const project = PROJECTS.find((project) => project.id === sectionId);
  console.log('project', project)
  return project ? project.colors : { background: 'white', primary: 'black' };
}

/**
 * Load projects into the DOM
 */
function loadProjects() {
  const projectsElement = document.getElementById('projects');
  const filterElement = document.getElementById('filters');
  let tags = [];

  for (projectIndex in PROJECTS) {
    const project = PROJECTS[projectIndex];
    const hasActiveTag = activeTags.every(val => project.tags.some(tag => tag.title === val));
    const previousProject = PROJECTS[projectIndex - 1];

    if (hasActiveTag || !activeTags.length) {
      projectsElement.insertAdjacentHTML('beforeend', /*html*/`
        <div
          id="transition-timeline-color-mash"
          style="
            background: linear-gradient(to top, ${project.colors.primary}, ${previousProject ? previousProject.colors.primary : project.colors.primary});});
            width: 6px;
            height: 128px;
            margin-left: 64px;
          "
        ></div>

        <div style="display: flex; align-items: center;">
          <img src="${project.image}" alt="" class="logo" style="${project.imageStyle}" />
          <h3 class="title">${project.title}</h3>
        </div>

        <div
          id="${project.id}"
          class="project col"
          style="border-left: 6px solid ${project.colors.primary}; padding-left: 64px; margin-left: 64px;"
        >
          <h5 class="position">${project.position}</h5>
          <p class="dates"><i>${project.dates}</i></p>
          <p class="description">${project.description}</p>
          <br/>
          <h6 class="subheader">Tags</h6>
          <div class="tags">
            ${project.tags.map((tag) => `
              <a 
                onclick="toggleTag('${tag.title}'); return false;" 
                href="#${tag.title}"
                class="noAfter"
                ${activeTags.includes(tag.title) ? `id="${tagsMap[tag.title]}-tag"` : ''}
              >
                ${tag.title}
              </a>
            `).join('')}
          </div>
          <h6 class="subheader">Links</h6>
          <div class="links row">
            ${project.links.map((link) => `
              <a
                href="${link.link}"
                class="link"
                target="_blank"
              >
                ${link.label}
              </a>
            `).join('')}
          </div>
        </div>
      `);
    }

    tags = [...tags, ...project.tags];
  }

  const counts = {};
  for (let tag of tags) counts[tag.title] 
    ? counts[tag.title]++
    : counts[tag.title] = 1;

  const topKeys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  filterElement.insertAdjacentHTML('beforeend', `
    <div id="filterTags">
      <div class="tags">
        ${topKeys.map((tag) => `
          <a 
            onclick="toggleTag('${tag}'); return false;" 
            href="#${tag}"
            ${activeTags.includes(tag) ? `id="${tagsMap[tag]}-tag"` : ''}
            data-count="${counts[tag]}"
          >
            ${tag}
          </a>
        `).join('')}
      </div>
    </div>
  `);
}

function clearProjects() {
  const projectsElement = document.getElementById('projects');
  const filterElement = document.getElementById('filterTags');
  
  // remove event listeners
  window.removeEventListener('scroll', handleScroll);

  while (projectsElement.firstChild) {
    projectsElement.removeChild(projectsElement.firstChild);
  }
  filterElement.remove();
}

/*  TOP TAG CATEGORIES

const typeCounts = {};
for (let tag of topKeys) typeCounts[tagsMap[tag]]
  ? typeCounts[tagsMap[tag]]++
  : typeCounts[tagsMap[tag]] = 1;

const topTypes = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a]);

<div class="tags">
  ${topTypes.map((type) => `
    <a 
      class="tag" 
      id="${type}-tag"
      data-count="${typeCounts[type]}"
    >
      ${type}
    </a>
  `).join('')}
</div>

*/

/**
 * Update dynamic dates ("for over {X} years")
 * - #experience-date: 2016 to present
 * - #learning-date: 2011 to present
 */
function updateDates() {
  const experienceDate = document.getElementById('experience-years');
  const learningDate = document.getElementById('learning-years');

  const learningYear = 2011;
  const experienceYear = 2016;
  const currentYear = new Date().getFullYear();

  const experienceYearsSince = currentYear - experienceYear;
  const learningYearsSince = currentYear - learningYear;

  console.log('experienceYearsSince', experienceYearsSince);
  console.log('learningYearsSince', learningYearsSince);

  experienceDate.innerText = experienceYearsSince
  learningDate.innerText = learningYearsSince
}
