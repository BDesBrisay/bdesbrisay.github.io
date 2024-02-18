
/**
 * @typedef {Object} Project - Past Experience
 * @property {string} id - Unique identifier
 * @property {string} image - Company logo/icon
 * @property {string} title - Company name
 * @property {string} position - Job title
 * @property {string} dates - Time worked
 * @property {string} description - Description of work 
 * Tags
 * @property {Array} tags - Tags for filtering
 *   @property {string} tags.title - Tag name
 *   @property {string} tags.type - Tag type
 * Links
 * @property {Array} links - Links to project 
 *   @property {string} links.label - Link label
 *   @property {string} links.link - Link URL
 * Colors
 * @property {Object} colors - Color scheme
 *   @property {string} background - Background color
 *   @property {string} primary - Primary color
 */
const PROJECTS = [
  {
    id: 'ready',
    image: './images/ready.svg',
    title: 'Ready.net',
    position: 'Fullstack Engineer, Platform Frontend Lead',
    dates: 'June 2020 - Present',
    description: 'Ready is a Y-Combinator funded platform specializing in providing internet services to internet service providers. As the Lead Frontend Engineer I built out the entire frontend clients for an enterprise BSS/OSS solution for ISPs, a subscriber facing subscription management portal (both web & mobile app). Built and maintained a large codebase over the span of 4 years. Led various teams and product design efforts for the frontend. Spearheaded the development of developer experience focused tools and libraries such as the shared React.js component library and the creation of frontend guidelines and standard shared across numerous repos.',
    tags: [
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'SPA', type: 'Technology' },
      { title: 'Frontend', type: 'Skill' },
      { title: 'React.js', type: 'Technology' },
      { title: 'CSS Modules', type: 'Technology' },
      { title: 'Backend', type: 'Skill' },
      { title: 'Apollo', type: 'Technology' },
      { title: 'GraphQL', type: 'Technology' },
      { title: 'React Native', type: 'Technology' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'Jest', type: 'Technology' },
      { title: 'GCP', type: 'Technology' },
      { title: 'Jenkins', type: 'Technology' },
    ],
    links: [
      {
        label: 'Website',
        link: 'https://ready.net'
      }
    ],
    colors: {
      background: '#2C2C54',
      primary: '#706FD3'
    }
  },
  {
    id: 'blazebuddies',
    image: './images/blazebuddies.png',
    imageStyle: 'margin-left: -12px;',
    title: 'BlazeBuddies',
    position: 'Founder, Frontend Developer & Designer',
    dates: 'January 2020 - Present',
    description: 'BlazeBuddies enables peer-to-peer, fully encrypted cannabis live streams and group video chats. I put together and styled the frontend client with a homemade single-page-application (SPA) framework using vanilla JavaScript, HTML, & CSS. I designed the logo as well as the overall UI and UX of the site.',
    tags: [
      { title: 'Socket.io', type: 'Technology' },
      { title: 'Peer.js', type: 'Technology' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'Graphic Design', type: 'Skill' },
      { title: 'SPA', type: 'Technology' },
      { title: 'Frontend', type: 'Skill' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://blazebuddies.com'
      }
    ],
    colors: {
      background: '#101010',
      primary: '#1abc9c' // '#e7596a'
    }
  },
  {
    id: 'donedingo',
    image: './images/donedingo.png',
    imageStyle: 'margin-left: -12px;',
    title: 'Donedingo',
    position: 'Founder',
    dates: 'October 2019 - December 2019',
    description: 'Donedingo is your private personal project planner based off of OKR and KPI techniques. This was a project for CSCI 3010 at the Univeristy of Colorado, Boulder during the semester of fall 2019. I built this project with a React.js frontend, CSS Modules for style, Firebase Auth for user accounts, Firebase Firestore for the database and storage, and custom unit tests for all database queries and mutations.',
    tags: [
      { title: 'React.js', type: 'Technology' },
      { title: 'CSS Modules', type: 'Technology' },
      { title: 'Firebase Auth', type: 'Technology' },
      { title: 'Firebase Firestore', type: 'Technology' },
      { title: 'Backend', type: 'Skill' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'Graphic Design', type: 'Skill' },
      { title: 'SPA', type: 'Technology' },
      { title: 'Frontend', type: 'Skill' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://donedingo.herokuapp.com'
      }
    ],
    colors: {
      background: '#302b63',
      primary: '#ffaf7b'
    }
  },
  {
    id: 'soapely',
    image: './images/soapely.png',
    title: 'Soapely',
    position: 'Software Developer Consultant',
    dates: 'July 2019 - Present',
    description: 'Soapely brings car washes and detailing to your driveway in 30 minutes or less. I desgined the logo, graphics, UI, & UX of the site and built the entire frontend in React.js & CSS Modules with a data layer of Apollo + GraphQL.',
    tags: [
      { title: 'React.js', type: 'Technology' },
      { title: 'GraphQL', type: 'Technology' },
      { title: 'Apollo', type: 'Technology' },
      { title: 'Socket.io', type: 'Technology' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'CSS Modules', type: 'Technology' },
      { title: 'UI/UX', type: 'SKill' },
      { title: 'Graphic Design', type: 'Skill' },
      { title: 'SPA', type: 'Technology' },
      { title: 'Frontend', type: 'Skill' },
      { title: 'Firebase Auth', type: 'Technology' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://soapelyapp.com'
      }
    ],
    colors: {
      background: '#001138',
      primary: '#58b8bf'
    }
  },
  {
    id: 'appearix',
    image: './images/appearix.png',
    title: 'Appearix',
    position: 'Founder, VP Engineering',
    dates: 'December 2018 - Present',
    description: 'Appearix is a single place to discover, create, and share events. I designed the logos, modified wireframes, styled the client, and built out the entire frontend interface in React.js, Apollo/GraphQL, CSS Modules. I also built out an entire app using React Native that was deployed to both the iOS app store and the Google Play store. Worked on event outreach with the administration at University of Colorado, Boulder and various clubs there too.',
    tags: [
      { title: 'React.js', type: 'Technology' },
      { title: 'React Native', type: 'Technology' },
      { title: 'GraphQL', type: 'Technology' },
      { title: 'Apollo', type: 'Technology' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'CSS Modules', type: 'Technology' },
      { title: 'iOS', type: 'Skill' },
      { title: 'Android', type: 'Skill' },
      { title: 'Mobile Application', type: 'Skill' },
      { title: 'SPA', type: 'Technology' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'Frontend', type: 'Skill' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://appearix.com'
      },
      {
        label: 'iOS App Store',
        link: 'https://apps.apple.com/us/app/appearix/id1474876873'
      }
    ],
    colors: {
      background: '#2c3e50',
      primary: '#4a90e2'
    }
  },
  {
    id: 'presearch',
    image: './images/presearch.png',
    title: 'Presearch.org',
    position: 'Software Developer Consultant',
    dates: 'October 2017 - Present',
    description: 'Presearch is an open, decentralized search engine that rewards community members with PRE, Presearch\'s cryptocurrency token, for their use of the engine. I built an entire frontend for this search engine using the bing API, Socket.io, React.js, CSS Modules, GraphQL, & Apollo. I also setup and built out a browser + search engine prototype in Electron and vanilla Javascript, HTML, and CSS. There is also a version with alternative results called Dsearch.com.',
    tags: [
      { title: 'Electron', type: 'Technology' },
      { title: 'React.js', type: 'Technology' },
      { title: 'GraphQL', type: 'Technology' },
      { title: 'Apollo', type: 'Technology' },
      { title: 'Socket.io', type: 'Technology' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'CSS Modules', type: 'Technology' },
      { title: 'SPA', type: 'Technology' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'Frontend', type: 'Skill' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://engine.presearch.org'
      },
      {
        label: 'Dsearch.com',
        link: 'https://dsearch.com'
      }
    ],
    colors: {
      background: '#2e2e2e',
      primary: '#127fff'
    }
  },
  {
    id: 'magnifyprogress',
    image: './images/magnifyprogress.png',
    title: 'Magnify.Progress',
    position: 'Frontend Engineer',
    dates: 'July 2017 - July 2018',
    description: 'Magnify Progress is a political social network that allows you to take action today and make a difference in your local politics. Assisted in front-end development of React.js components and assembly of React Native iOS/Android app. Facilitated UX/UI and overall design of website and mobile app.',
    tags: [
      { title: 'React.js', type: 'Technology' },
      { title: 'React Native', type: 'Technology' },
      { title: 'GraphQL', type: 'Technology' },
      { title: 'Apollo', type: 'Technology' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'CSS Modules', type: 'Technology' },
      { title: 'iOS', type: 'Skill' },
      { title: 'Android', type: 'Skill' },
      { title: 'Mobile Application', type: 'Skill' },
      { title: 'SPA', type: 'Technology' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'Frontend', type: 'Skill' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://www.magnifyprogress.com/'
      },
      {
        label: 'iOS App Store',
        link: 'https://itunes.apple.com/us/app/magnify-progress/id1345672005'
      },
      {
        label: 'Google Play Store',
        link: 'https://play.google.com/store/apps/details?id=com.magnifyprogress'
      }
    ],
    colors: {
      background: '#2f4866',
      primary: '#847aa0'
    }
  },
  {
    id: 'realid',
    image: './images/realid.png',
    title: 'Real Identities',
    position: 'Freelance Web Developer',
    dates: 'August 2016 - February 2017',
    description: 'Real Identities help vendors check and verify the integrity of an ID card. Remodeled the user interface and assembled entire website from scratch. Used HTML, CSS, Javascript, and PHP in both design and development of website. Created SEO focused design and interface.',
    tags: [
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'PHP', type: 'Language' },
      { title: 'Frontend', type: 'Skill' },
      { title: 'Backend', type: 'Skill' },
      { title: 'SEO', type: 'Skill' },
      { title: 'Graphic Design', type: 'Skill' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'Web Application', type: 'Skill' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://realidentities.com'
      }
    ],
    colors: {
      background: '#1e1e1e',
      primary: '#628ba1'
    }
  },
  {
    id: 'harvix',
    image: './images/harvix.png',
    title: 'Harvix',
    position: 'Founder, Web Developer',
    dates: 'January 2011 - August 2015',
    description: 'Harvix is a research engine designed to provide students with relevant data upfront. I developed the front-end aspects for a new web search engine for students. I recruited and collaborated successfully with an international team while acquiring partnerships with WolframAlpha, Seattle Public Schools, and Reddit. Organized meetings with Sequoia Union High School District about widespread implementation.',
    tags: [
      { title: 'JavaScript, HTML, CSS', type: 'Language' },
      { title: 'Web Application', type: 'Skill' },
      { title: 'Recruiting', type: 'Skill' },
      { title: 'Marketing', type: 'Skill' },
      { title: 'UI/UX', type: 'Skill' },
      { title: 'Graphic Design', type: 'Skill' }
    ],
    links: [
      {
        label: 'Website',
        link: 'https://harvix.com'
      }
    ],
    colors: { // red and black
      background: '#2f2f2f',
      primary: '#ff0000'
    }
  }
]