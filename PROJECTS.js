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
    id: "inspectmind",
    image: "./images/inspectmind.png",
    title: "InspectMind.AI",
    position: "Senior Software Engineer",
    dates: "October 2024 - Present",
    description:
      "InspectMind is a Y-Combinator AI-powered platform that transforms photos and notes taken on-site into comprehensive, customized reports. As a Senior Software Engineer, I lead various projects and have successfully shipped numerous features, including camera functionality, real-time collaboration, markup tools, AI-generated reports, user authentication, push notifications, offline support, and more.",
    tags: [
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "UI/UX", type: "Skill" },
      { title: "Frontend", type: "Skill" },
      { title: "React.js", type: "Technology" },
      { title: "DynamoDB", type: "Technology" },
      { title: "Backend", type: "Skill" },
      { title: "React Native", type: "Technology" },
      { title: "React Native Web", type: "Technology" },
      { title: "Web Application", type: "Skill" },
      { title: "Mobile Application", type: "Skill" },
      { title: "AWS", type: "Technology" },
      { title: "Node.js", type: "Technology" },
      { title: "Websockets", type: "Technology" },
      { title: "iOS", type: "Skill" },
      { title: "Android", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://www.inspectmind.ai",
      },
      {
        label: "iOS App Store",
        link: "https://apps.apple.com/us/app/inspectmind-ai/id6475725008",
      },
      {
        label: "Google Play Store",
        link: "https://play.google.com/store/apps/details?id=com.inspectmindapp&hl=en_US",
      },
    ],
    colors: {
      background: "#ce6fd3",
      primary: "#ce6fd3",
    },
  },
  {
    id: "ready",
    image: "./images/ready.svg",
    title: "Ready.net",
    position: "Fullstack Engineer, Platform Frontend Lead",
    dates: "June 2020 - June 2024",
    description:
      "Ready is a Y-Combinator (S20) funded platform specializing in providing internet services to internet service providers. As the Lead Frontend Engineer I built out the entire frontend clients for an enterprise BSS/OSS solution for ISPs, a subscriber facing subscription management portal (both web & mobile app). Built and maintained a large codebase over the span of 4 years. Led various teams and product design efforts for the frontend. Spearheaded the development of developer experience focused tools and libraries such as the shared React.js component library and the creation of frontend guidelines and standard shared across numerous repos.",
    tags: [
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "UI/UX", type: "Skill" },
      { title: "SPA", type: "Technology" },
      { title: "Frontend", type: "Skill" },
      { title: "React.js", type: "Technology" },
      { title: "CSS Modules", type: "Technology" },
      { title: "Backend", type: "Skill" },
      { title: "Apollo", type: "Technology" },
      { title: "GraphQL", type: "Technology" },
      { title: "React Native", type: "Technology" },
      { title: "Web Application", type: "Skill" },
      { title: "Mobile Application", type: "Skill" },
      { title: "Jest", type: "Technology" },
      { title: "GCP", type: "Technology" },
      { title: "Jenkins", type: "Technology" },
      { title: "Node.js", type: "Technology" },
    ],
    links: [
      {
        label: "Website",
        link: "https://ready.net",
      },
    ],
    colors: {
      background: "#706FD3",
      primary: "#706FD3",
    },
  },
  {
    id: "blazebuddies",
    image: "./images/blazebuddies.png",
    imageStyle: "margin-left: -12px;",
    title: "Howlix",
    position: "Founder, Frontend Developer & Designer",
    dates: "January 2020 - June 2020",
    description:
      "Howlix enables peer-to-peer, fully encrypted live streams and group video chats. I put together and styled the frontend client with a homemade single-page-application (SPA) framework using vanilla JavaScript, HTML, & CSS. I designed the logo as well as the overall UI and UX of the site.",
    tags: [
      { title: "Socket.io", type: "Technology" },
      { title: "Websockets", type: "Technology" },
      { title: "Peer.js", type: "Technology" },
      { title: "Web Application", type: "Skill" },
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "UI/UX", type: "Skill" },
      { title: "Graphic Design", type: "Skill" },
      { title: "SPA", type: "Technology" },
      { title: "Frontend", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://howlix.com",
      },
    ],
    colors: {
      // background: '#1abc9c',
      background: "#4a90e2",
      primary: "#e7596a",
    },
  },
  {
    id: "donedingo",
    image: "./images/donedingo.png",
    imageStyle: "margin-left: -12px;",
    title: "Donedingo",
    position: "Founder",
    dates: "October 2019 - December 2019",
    description:
      "Donedingo is your private personal project planner based off of OKR and KPI techniques. This was a project for CSCI 3010 at the Univeristy of Colorado, Boulder during the semester of fall 2019. I built this project with a React.js frontend, CSS Modules for style, Firebase Auth for user accounts, Firebase Firestore for the database and storage, and custom unit tests for all database queries and mutations.",
    tags: [
      { title: "React.js", type: "Technology" },
      { title: "CSS Modules", type: "Technology" },
      { title: "Firebase Auth", type: "Technology" },
      { title: "Firebase Firestore", type: "Technology" },
      { title: "Backend", type: "Skill" },
      { title: "Web Application", type: "Skill" },
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "UI/UX", type: "Skill" },
      { title: "Graphic Design", type: "Skill" },
      { title: "SPA", type: "Technology" },
      { title: "Frontend", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://donedingo.herokuapp.com",
      },
    ],
    colors: {
      background: "#302b63",
      primary: "#ffaf7b",
    },
  },
  {
    id: "soapely",
    image: "./images/soapely.png",
    title: "Soapely",
    position: "Software Developer Consultant",
    dates: "July 2019 - October 2019",
    description:
      "Soapely brings car washes and detailing to your driveway in 30 minutes or less. I desgined the logo, graphics, UI, & UX of the site and built the entire frontend in React.js & CSS Modules with a data layer of Apollo + GraphQL.",
    tags: [
      { title: "React.js", type: "Technology" },
      { title: "GraphQL", type: "Technology" },
      { title: "Apollo", type: "Technology" },
      { title: "Socket.io", type: "Technology" },
      { title: "Web Application", type: "Skill" },
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "CSS Modules", type: "Technology" },
      { title: "UI/UX", type: "SKill" },
      { title: "Graphic Design", type: "Skill" },
      { title: "SPA", type: "Technology" },
      { title: "Frontend", type: "Skill" },
      { title: "Firebase Auth", type: "Technology" },
    ],
    links: [
      {
        label: "Website",
        link: "https://soapelyapp.com",
      },
    ],
    colors: {
      background: "#58b8bf",
      primary: "#58b8bf",
    },
  },
  {
    id: "appearix",
    image: "./images/appearix.png",
    title: "Appearix",
    position: "Founder, VP Engineering",
    dates: "December 2018 - January 2020",
    description:
      "Appearix is a single place to discover, create, and share events. I designed the logos, modified wireframes, styled the client, and built out the entire frontend interface in React.js, Apollo/GraphQL, CSS Modules. I also built out an entire app using React Native that was deployed to both the iOS app store and the Google Play store. Worked on event outreach with the administration at University of Colorado, Boulder and various clubs there too.",
    tags: [
      { title: "React.js", type: "Technology" },
      { title: "React Native", type: "Technology" },
      { title: "GraphQL", type: "Technology" },
      { title: "Apollo", type: "Technology" },
      { title: "Web Application", type: "Skill" },
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "CSS Modules", type: "Technology" },
      { title: "iOS", type: "Skill" },
      { title: "Android", type: "Skill" },
      { title: "Mobile Application", type: "Skill" },
      { title: "SPA", type: "Technology" },
      { title: "UI/UX", type: "Skill" },
      { title: "Frontend", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://appearix.com",
      },
      {
        label: "iOS App Store",
        link: "https://apps.apple.com/us/app/appearix/id1474876873",
      },
    ],
    colors: {
      background: "#4a90e2",
      primary: "#4a90e2",
    },
  },
  {
    id: "presearch",
    image: "./images/presearch.png",
    title: "Presearch",
    position: "Software Developer Consultant",
    dates: "October 2017 - December 2018",
    description:
      "Presearch is an open, decentralized search engine that rewards community members with PRE, Presearch's cryptocurrency token, for their use of the engine. I built an entire frontend for this search engine using the bing API, Socket.io, React.js, CSS Modules, GraphQL, & Apollo. I also setup and built out a browser + search engine prototype in Electron and vanilla Javascript, HTML, and CSS. There is also a version with alternative results called Dsearch.com.",
    tags: [
      { title: "Electron", type: "Technology" },
      { title: "React.js", type: "Technology" },
      { title: "GraphQL", type: "Technology" },
      { title: "Apollo", type: "Technology" },
      { title: "Socket.io", type: "Technology" },
      { title: "Web Application", type: "Skill" },
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "CSS Modules", type: "Technology" },
      { title: "SPA", type: "Technology" },
      { title: "UI/UX", type: "Skill" },
      { title: "Frontend", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://engine.presearch.org",
      },
      {
        label: "Dsearch.com",
        link: "https://dsearch.com",
      },
    ],
    colors: {
      background: "#127fff",
      primary: "#127fff",
    },
  },
  {
    id: "magnifyprogress",
    image: "./images/magnifyprogress.png",
    title: "Magnify.Progress",
    position: "Frontend Engineer",
    dates: "July 2017 - July 2018",
    description:
      "Magnify Progress is a political social network that allows you to take action today and make a difference in your local politics. Assisted in front-end development of React.js components and assembly of React Native iOS/Android app. Facilitated UX/UI and overall design of website and mobile app.",
    tags: [
      { title: "React.js", type: "Technology" },
      { title: "React Native", type: "Technology" },
      { title: "GraphQL", type: "Technology" },
      { title: "Apollo", type: "Technology" },
      { title: "Web Application", type: "Skill" },
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "CSS Modules", type: "Technology" },
      { title: "iOS", type: "Skill" },
      { title: "Android", type: "Skill" },
      { title: "Mobile Application", type: "Skill" },
      { title: "SPA", type: "Technology" },
      { title: "UI/UX", type: "Skill" },
      { title: "Frontend", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://www.magnifyprogress.com/",
      },
      {
        label: "iOS App Store",
        link: "https://itunes.apple.com/us/app/magnify-progress/id1345672005",
      },
      {
        label: "Google Play Store",
        link: "https://play.google.com/store/apps/details?id=com.magnifyprogress",
      },
    ],
    colors: {
      background: "#6090c9",
      primary: "#847aa0",
    },
  },
  {
    id: "realid",
    image: "./images/realid.png",
    title: "Real Identities",
    position: "Freelance Web Developer",
    dates: "August 2016 - February 2017",
    description:
      "Real Identities help vendors check and verify the integrity of an ID card. Remodeled the user interface and assembled entire website from scratch. Used HTML, CSS, Javascript, and PHP in both design and development of website. Created SEO focused design and interface.",
    tags: [
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "PHP", type: "Language" },
      { title: "Frontend", type: "Skill" },
      { title: "Backend", type: "Skill" },
      { title: "SEO", type: "Skill" },
      { title: "Graphic Design", type: "Skill" },
      { title: "UI/UX", type: "Skill" },
      { title: "Web Application", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://realidentities.com",
      },
    ],
    colors: {
      background: "#628ba1",
      primary: "#628ba1",
    },
  },
  {
    id: "harvix",
    // image: './images/harvix.png',
    title:
      '<h1 style="color: white;">Har<span style="color: red;">vix</span></h1>',
    position: "Founder, Web Developer",
    dates: "January 2011 - August 2015",
    description:
      "Harvix is a research engine designed to provide students with relevant data upfront. I developed the front-end aspects for a new web search engine for students. I recruited and collaborated successfully with an international team while acquiring partnerships with WolframAlpha, Seattle Public Schools, and Reddit. Organized meetings with Sequoia Union High School District about widespread implementation.",
    tags: [
      { title: "JavaScript, HTML, CSS", type: "Language" },
      { title: "Web Application", type: "Skill" },
      { title: "Recruiting", type: "Skill" },
      { title: "Marketing", type: "Skill" },
      { title: "UI/UX", type: "Skill" },
      { title: "Graphic Design", type: "Skill" },
    ],
    links: [
      {
        label: "Website",
        link: "https://harvix.com",
      },
    ],
    colors: {
      background: "#000000",
      primary: "#ff0000",
    },
  },
];
