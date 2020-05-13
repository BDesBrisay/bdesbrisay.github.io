(() => {
  console.log('RUN', firebase);

  const preObject = document.getElementById('object');
  const dbRefObject = firebase.database().ref().child('object');
  
  dbRefObject.on('value', snap => {
    console.log(snap.val()); 
    preObject.innerText = JSON.stringify(snap.val(), null, 3);
  });
})();