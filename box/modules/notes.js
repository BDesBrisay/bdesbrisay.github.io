const notesBox = document.getElementById('notes');

function getNotes() {
  const notes = localStorage.getItem('brycebox-notes');
  console.log(notes)
  notesBox.innerText = notes;
}

function takeNotes() {
  console.log('what')
  const value = notesBox.value;
  localStorage.setItem('brycebox-notes', value);
}

getNotes();