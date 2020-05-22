function startTime() {
  const today = new Date();
  const h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);

  document.getElementById('time').innerHTML = (h % 12) + ":" + m + ":" + s + (h > 12 ? 'pm' : 'am');
  setTimeout(startTime, 500);
}

function checkTime(i) {
  if (i < 10) i = "0" + i;
  return i;
}

startTime();