const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

let startYear = 2011;
const dateHeight = 40;
const endYear = new Date().getFullYear();
const endMonth = new Date().getMonth();
const dateCount = ((endYear - startYear) * 12) + (endMonth + 1);

function init() {
  const timeline = document.getElementById('timeline');

  while (startYear <= endYear) {
    const lastYear = startYear === endYear;
    for (let month in months) {
      if (month <= endMonth || !lastYear) { 
        console.log(month)
        timeline.insertAdjacentHTML('afterbegin', `
          <div class="date">${months[month]}${month == 0 ? `<span>${startYear}</span><hr>` : ''}</div>
        `);
      }
    }
    // if (!lastYear) timeline.insertAdjacentHTML('afterbegin', '<hr><hr>')
    startYear++;
  }

  for (let idx in projects) {
    const project = projects[idx];
    const heightCount = rangeToHeight(project.start, project.end);
    const heightPixels = (heightCount * dateHeight) + dateHeight;

    const bottomPixels = rangeToHeight('January 2011', project.start) * dateHeight;

    timeline.insertAdjacentHTML('beforeend', `
      <div 
        class="project" 
        style="
          background: ${project.color}; 
          height: ${heightPixels}px;
          bottom: ${bottomPixels}px;
          right: calc(((100vw - 250px) / 8) * ${idx});
        "
      >
      
      </div>
    `);
  }
}

function rangeToHeight(s, e) {
  s = new Date(s);
  if (e === 'Present') e = new Date();
  else e = new Date(e);

  return e.getMonth() - s.getMonth() + (12 * (e.getFullYear() - s.getFullYear()));
}

const projects = [
  {
    title: 'BlazeBuddies',
    start: 'January 2020',
    end: 'Present',
    color: '#e7596a'
  },
  {
    title: 'Donedingo',
    start: 'October 2019',
    end: 'December 2019',
    color: '#ffaf7b'
  },
  {
    title: 'Soapely',
    start: 'July 2019',
    end: 'Present',
    color: '#1abc9c'
  },
  {
    title: 'Appearix',
    start: 'December 2018',
    end: 'Present',
    color: '#4a90e2'
  },
  {
    title: 'Presearch.org',
    start: 'October 2017',
    end: 'Present',
    color: '#3591fc'
  },
  {
    title: 'Magnify.Progress',
    start: 'July 2017',
    end: 'July 2018',
    color: '#e37263'
  },
  {
    title: 'Real Identities',
    start: 'August 2016',
    end: 'February 2017',
    color: '#447a90'
  },
  {
    title: 'Harvix',
    start: 'January 2011',
    end: 'August 2015',
    color: '#d33'
  }
];
    