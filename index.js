const projects = [
  {
    image: './images/blazebuddies.png',
    title: 'BlazeBuddies',
    position: 'Cofounder, Frontend Developer & Designer',
    dates: 'January 2020 - Present',
    description: 'BlazeBuddies enables peer-to-peer, fully encrypted cannabis live streams and group video chats. I put together the entire frontend client with a homemade single-page-application (SPA) framework using vanilla JavaScript, HTML, & CSS. I designed the logo as well as the overall UI and UX of the site.',
    tags: [
      'Socket.io',
      'Peer.js',
      'JavaScript',
      'HTML',
      'CSS',
      'UI/UX',
      'Graphic Design',
      'SPA',
      'Frontend'
    ]
  },
  {
    image: './images/donedingo.png',
    title: 'Donedingo',
    position: 'Founder',
    dates: 'October 2019 - December 2019',
    description: 'Donedingo is your private personal project planner based off of OKR and KPI techniques. This was a project for CSCI 3010 at the Univeristy of Colorado, Boulder during the semester of fall 2019. I built this project with a React.js frontend, CSS Modules for style, Firebase Auth for user accounts, Firebase Firestore for the database and storage, and custom unit tests for all database queries and mutations.',
    tags: [
      'React.js',
      'CSS Modules',
      'Firebase Auth',
      'Firebase Firestore',
      'JavaScript',
      'Frontend',
      'Backend',
      'Graphic Design',
      'UI/UX',
      'SPA',
      'HTML',
      'CSS'
    ]
  },
  {
    image: './images/soapely.png',
    title: 'Soapely',
    position: 'Lead Frontend Engineer',
    dates: 'July 2019 - January 2020',
    description: 'Soapely brings car washes and detailing to your driveway in 30 minutes or less. I desgined the logo, graphics, UI, & UX of the site and built the entire frontend in React.js & CSS Modules with a data layer of Apollo + GraphQL.',
    tags: [
      'React.js',
      'GraphQL',
      'Apollo',
      'Socket.io',
      'JavaScript',
      'CSS Modules',
      'CSS',
      'UI/UX',
      'Graphic Design',
      'SPA',
      'Frontend',
      'Firebase Auth'
    ]
  },
  {
    image: '',
    title: '',
    position: '',
    dates: '',
    descrtiption: '',
    tags: []
  }
]

let activeTags = [];

function init() {
  const urlHash = window.location.hash;
  activeTags = decodeURIComponent(urlHash).split('#').slice(1);

  loadProjects();
}

function toggleTag(tag) {
  const loc = window.location;
  if (activeTags.includes(tag)) activeTags = activeTags.filter((i) => i !== tag);
  else activeTags = [...activeTags, tag];

  const extention = activeTags.length ? activeTags.map((tag) => `#${tag}`).join('') : '';
  window.location = loc.origin + loc.pathname + extention;

  clearProjects();
  loadProjects();
}

function loadProjects() {
  const projectsElement = document.getElementById('projects');
  const filterElement = document.getElementById('filters');
  let tags = [];

  for (project of projects) {
    const hasActiveTag = activeTags.every(val => project.tags.includes(val));

    if (hasActiveTag || !activeTags.length) {
      projectsElement.insertAdjacentHTML('beforeend', `
        <div class="project col">
          <img src="${project.image}" alt="" class="logo" />
          <h3 class="title">${project.title}</h3>
          <h5 class="position">${project.position}</h5>
          <p class="dates"><i>${project.dates}</i></p>
          <p class="description">${project.description}</p>
          <h6 class="subheader">Tags</h6>
          <div class="tags">
            ${project.tags.map((tag) => `
              <a 
                onclick="toggleTag('${tag}'); return false;" 
                href="#${tag}"
                ${activeTags.includes(tag) ? 'class="activeTag"' : ''}
              >
                ${tag}
              </a>
            `).join('')}
          </div>
        </div>
      `);
    }

    tags = [...new Set([...tags, ...project.tags])];
  }

  filterElement.insertAdjacentHTML('beforeend', `
    <div class="tags" id="filterTags">
      ${tags.map((tag) => `
        <a 
          onclick="toggleTag('${tag}'); return false;" 
          href="#${tag}"
          ${activeTags.includes(tag) ? 'class="activeTag"' : ''}
        >
          ${tag}
        </a>
      `).join('')}
    </div>
  `);
}

function clearProjects() {
  const projectsElement = document.getElementById('projects');
  const filterElement = document.getElementById('filterTags');

  while (projectsElement.firstChild) {
    projectsElement.removeChild(projectsElement.firstChild);
  }
  filterElement.remove();
}