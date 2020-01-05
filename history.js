window.onscroll = (e) => {
  console.log(e, e.deltaY, e.wheelData)


  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;

  // const percent = scrolled + 9;
  document.getElementById('progressBar').style.height = scrolled + '%';

  const ints = [0, 6, 14, 25, 33.3, 41.7, 50, 58.3, 69, 77, 86, 95];
  // const ints = [0, 9, 18, 27, 36, 45, 54, 63, 72, 81, 91, 100];
  // const closest = ints.reduce((prev, curr) => Math.abs(curr - scrolled) < Math.abs(prev - scrolled) ? curr : prev);
  const closest = ints.reduce((prev, curr) => scrolled > curr ? curr : prev);

  const index = 12 - ints.indexOf(closest);

  const link = document.getElementById(`to${index}`)

  link.className = 'before';
}