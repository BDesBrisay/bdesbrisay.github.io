window.onscroll = (e) => {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;

  document.getElementById('progressBar').style.height = scrolled + '%';

  const ints = [0, 6, 14, 22, 30, 38, 46, 54, 62, 70, 78, 86, 94];
  const closest = ints.reduce((prev, curr) => scrolled > curr ? curr : prev);
  const index = 13 - ints.indexOf(closest);

  let i = 1;
  while (i < 13) {
    const link = document.getElementById(`to${i}`);
    if (i >= index) link.className = 'before';
    else link.className = '';
    i++;
  }
}