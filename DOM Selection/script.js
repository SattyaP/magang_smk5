//GET ELEMENT
const judul = document.getElementById('judul');
//EDIT
judul.innerHTML = 'Hai Dunia'
judul.style.backgroundColor = '#cccccc';

const p = document.getElementsByTagName('p');
p[0].style.backgroundColor = 'red';

for (let i = 1; i < p.length - 1; i++) {
    p[i].style.backgroundColor = 'lightgreen';
}

//HTML COLLECTION
const h1 = document.getElementsByTagName('h1');
h1[0].style.fontSize = '10px';

const p1 = document.getElementsByClassName('p1');
p1[0].innerHTML = 'Di ubah dari javascript';

const p4 = document.querySelector('#b p');
p4.style.color = 'yellow';
p4.style.fontSize = '30px';


const li2 = document.querySelector('section#b ul li:nth-child(2');
li2.style.backgroundColor = 'lightblue';

const pi = document.querySelectorAll('p');
p[3].style.backgroundColor = 'violet'