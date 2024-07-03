// Ambil elemen dengan class 'p3'
const p3 = document.querySelector('.p3');
const p2 = document.querySelector('.p2');

// Fungsi untuk mengubah warna latar belakang elemen 'p3'
function ubahp3() {
    p3.style.backgroundColor = 'lightgreen';
}

// Ambil elemen paragraf dalam section dengan id 'b'
const p4 = document.querySelector('section#b p');

// Tambahkan event listener untuk klik pada elemen 'p4'
p4.addEventListener('click', function () {
    // Ambil elemen ul dalam section dengan id 'b'
    const ul = document.querySelector('section#b ul');
    // Buat elemen li baru
    const liBaru = document.createElement('li');
    // Buat teks untuk elemen li baru
    const teksLiBaru = document.createTextNode('item baru');
    // Tambahkan teks ke dalam elemen li baru
    liBaru.appendChild(teksLiBaru);
    // Tambahkan elemen li baru ke dalam ul
    ul.appendChild(liBaru);
});


p2.onclick = function(){
    p2.style.backgroundColor = 'lightblue';
}

p2.onclick = function(){
    p2.style.color = 'red';
}

p2.addEventListener('mouseenter', function () {
    p2.style.backgroundColor = 'Blue';
});
p2.addEventListener('mouseleave', function () {
    p2.style.backgroundColor = 'white';
});