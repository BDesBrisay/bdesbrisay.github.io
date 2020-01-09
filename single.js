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

let currentYear = new Date().getFullYear();
const endYear = 2011;

function init() {
  const timeline = document.getElementById('timeline');

  while (currentYear >= endYear) {
    for (let month of months) {
      timeline.insertAdjacentHTML('beforeend', `
        <div class="date">${month} - ${currentYear}</p>
      `);
    }
    currentYear--;
  }
}