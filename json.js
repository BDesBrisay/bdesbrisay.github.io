function htmlEscape(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function init() {
  const json = document.getElementById('json');
  for (let project of projects) {
    json.insertAdjacentHTML('beforeend', printObject(project, 1));
  }
}

function printObject(obj, level) {
  let str = `<span class="i${level}">{</span><br/>`;

  for (let key of Object.keys(obj)) {
    const item = obj[key];

    if (key !== 'imageStyle') {
      str += `
        <p class="i${level + 1}">
          <b>${key}:</b>
          ${key === 'tags' || key === 'links'
            ? printArray(item, level + 1)
            : key === 'image'
              ? printImage(item, level + 1)
              : key === 'title'
                ? `<strong>${item}</strong>`
                : key === 'link'
                  ? `<a href="${item}">${item}</a>`
                  : item
          }
        </p>
      \n`;
    }
  }

  str += `<span class="i${level}">}</span><br/>`;
  return str;
}

function printArray(arr, level) {
  let str = `<span>[</span></p>`;

  for (let item of arr) {
    typeof item === 'object'
      ? str += printObject(item, level + 1)
      : str += `<i class="i${level + 1}">${item}</i><br/>`;
  }

  str += `<span class="i${level}">]</span><br/><p>`;
  return str;
}

function printImage(src) {
  return `<img src="${src}" alt="" />`;
}

const projects = [
  {
    image: './images/blazebuddies.png',
    imageStyle: 'margin-left: -12px;',
    title: 'BlazeBuddies',
    position: 'Founder, Frontend Developer & Designer',
    dates: 'January 2020 - Present',
    description: 'BlazeBuddies enables peer-to-peer, fully encrypted cannabis live streams and group video chats. I put together and styled the frontend client with a homemade single-page-application (SPA) framework using vanilla JavaScript, HTML, & CSS. I designed the logo as well as the overall UI and UX of the site.',
    tags: [
      'Socket.io',
      'Peer.js',
      'Web Application',
      'JavaScript, HTML, CSS',
      'UI/UX',
      'Graphic Design',
      'SPA',
      'Frontend'
    ],
    links: [
      {
        label: 'Website',
        link: 'https://blazebuddies.com'
      }
    ]
  },
  {
    image: './images/donedingo.png',
    imageStyle: 'margin-left: -12px;',
    title: 'Donedingo',
    position: 'Founder',
    dates: 'October 2019 - December 2019',
    description: 'Donedingo is your private personal project planner based off of OKR and KPI techniques. This was a project for CSCI 3010 at the Univeristy of Colorado, Boulder during the semester of fall 2019. I built this project with a React.js frontend, CSS Modules for style, Firebase Auth for user accounts, Firebase Firestore for the database and storage, and custom unit tests for all database queries and mutations.',
    tags: [
      'React.js',
      'CSS Modules',
      'Firebase Auth',
      'Firebase Firestore',
      'Web Application',
      'JavaScript, HTML, CSS',
      'Frontend',
      'Backend',
      'Graphic Design',
      'UI/UX',
      'SPA',
    ],
    links: [
      {
        label: 'Website',
        link: 'https://donedingo.herokuapp.com'
      }
    ]
  },
  {
    image: './images/soapely.png',
    title: 'Soapely',
    position: 'Software Developer Consultant',
    dates: 'July 2019 - Present',
    description: 'Soapely brings car washes and detailing to your driveway in 30 minutes or less. I desgined the logo, graphics, UI, & UX of the site and built the entire frontend in React.js & CSS Modules with a data layer of Apollo + GraphQL.',
    tags: [
      'React.js',
      'GraphQL',
      'Apollo',
      'Socket.io',
      'Web Application',
      'JavaScript, HTML, CSS',
      'CSS Modules',
      'UI/UX',
      'Graphic Design',
      'SPA',
      'Frontend',
      'Firebase Auth'
    ],
    links: [
      {
        label: 'Website',
        link: 'https://soapelyapp.com'
      }
    ]
  },
  {
    image: './images/appearix.png',
    title: 'Appearix',
    position: 'Founder, VP Engineering',
    dates: 'December 2018 - Present',
    description: 'Appearix is a single place to discover, create, and share events. I designed the logos, modified wireframes, styled the client, and built out the entire frontend interface in React.js, Apollo/GraphQL, CSS Modules. I also built out an entire app using React Native that was deployed to both the iOS app store and the Google Play store. Worked on event outreach with the administration at University of Colorado, Boulder and various clubs there too.',
    tags: [
      'React.js',
      'React Native',
      'GraphQL',
      'Apollo',
      'Web Application',
      'JavaScript, HTML, CSS',
      'CSS Modules',
      'iOS',
      'Android',
      'Mobile Application',
      'SPA',
      'UI/UX',
      'Frontend'
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
    ]
  },
  {
    image: './images/presearch.png',
    title: 'Presearch.org',
    position: 'Software Developer Consultant',
    dates: 'October 2017 - Present',
    description: 'Presearch is an open, decentralized search engine that rewards community members with PRE, Presearch\'s cryptocurrency token, for their use of the engine. I built an entire frontend for this search engine using the bing API, Socket.io, React.js, CSS Modules, GraphQL, & Apollo. I also setup and built out a browser + search engine prototype in Electron and vanilla Javascript, HTML, and CSS. There is also a version with alternative results called Dsearch.com.',
    tags: [
      'Electron',
      'React.js',
      'GraphQL',
      'Apollo',
      'Socket.io',
      'Web Application',
      'JavaScript, HTML, CSS',
      'CSS Modules',
      'SPA',
      'UI/UX',
      'Frontend'
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
    ]
  },
  {
    image: './images/magnifyprogress.png',
    title: 'Magnify.Progress',
    position: 'Frontend Engineer',
    dates: 'July 2017 - July 2018',
    description: 'Magnify Progress is a political social network that allows you to take action today and make a difference in your local politics. Assisted in front-end development of React.js components and assembly of React Native iOS/Android app. Facilitated UX/UI and overall design of website and mobile app.',
    tags: [
      'React.js',
      'React Native',
      'GraphQL',
      'Apollo',
      'Web Application',
      'JavaScript, HTML, CSS',
      'CSS Modules',
      'iOS',
      'Android',
      'Mobile Application',
      'SPA',
      'UI/UX',
      'Frontend'
    ],
    links: [
      {
        label: 'Website',
        link: 'https://magnify.progress'
      },
      {
        label: 'iOS App Store',
        link: 'https://itunes.apple.com/us/app/magnify-progress/id1345672005'
      },
      {
        label: 'Google Play Store',
        link: 'https://play.google.com/store/apps/details?id=com.magnifyprogress'
      }
    ]
  },
  {
    image: './images/realid.png',
    title: 'Real Identities',
    position: 'Freelance Web Developer',
    dates: 'August 2016 - February 2017',
    description: 'Real Identities help vendors check and verify the integrity of an ID card. Remodeled the user interface and assembled entire website from scratch. Used HTML, CSS, Javascript, and PHP in both design and development of website. Created SEO focused design and interface.',
    tags: [
      'JavaScript, HTML, CSS',
      'PHP',
      'Frontend',
      'Backend',
      'SEO',
      'Graphic Design',
      'UI/UX',
      'Web Application'
    ],
    links: [
      {
        label: 'Website',
        link: 'https://realidentities.com'
      }
    ]
  },
  {
    image: './images/harvix.png',
    title: 'Harvix',
    position: 'Founder, Web Developer',
    dates: 'January 2011 - August 2015',
    description: 'Harvix is a research engine designed to provide students with relevant data upfront. I developed the front-end aspects for a new web search engine for students. I recruited and collaborated successfully with an international team while acquiring partnerships with WolframAlpha, Seattle Public Schools, and Reddit. Organized meetings with Sequoia Union High School District about widespread implementation.',
    tags: [
      'JavaScript, HTML, CSS',
      'Web Application',
      'Recruiting',
      'Marketing',
      'UI/UX',
      'Graphic Design'
    ],
    links: [
      {
        label: 'Website',
        link: 'https://harvix.com'
      }
    ]
  }
];
    