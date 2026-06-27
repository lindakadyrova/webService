'use strict';
const $input = document.querySelector('#input');
const $output = document.querySelector('#output');

// custom behavior on form-submit
$input.addEventListener('submit', (event) => {
  event.preventDefault();
  // get the values for title and description
  const data = {
    title: $input.querySelector('#title').value,
    description: $input.querySelector('#description').value,
  };
  console.log(data);

fetch('http://127.0.0.1:8080/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((note) => addNote(note))
  .catch((err) => console.error(err));
});

// fetch example. will GET all notes on start
fetch('http://127.0.0.1:8080/notes')
  .then((response) => response.json())
  .then((data) => data.forEach(addNote))
  .catch((err) => console.error(err));


// add a new note to the DOM
function addNote(note) {
  console.log(note);
  const template = document.querySelector('#note');
  const clone = template.content.cloneNode(true);
  clone.querySelector('h3').textContent = note.title;
  clone.querySelector('p').textContent = note.description;

  $output.appendChild(clone);
}