//Merubah text
const judul = document.getElementById('judul');
judul.innerHTML = 'Calvin';

// const sectionA = document.querySelector('section#a');
// sectionA.innerHTML = '<div><p>Hello </p></div>';

//Tambah Atribute
const judul_ = document.getElementsByTagName('h2')[0];   
judul_.setAttribute('name', 'hai');

const p2 = document.querySelector('.p2');
p2.classList.add('label');
// p2.classList.remove('label');
