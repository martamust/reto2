const fs = require('fs');
const path = require('path');

const listadoPelis = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'listadoPelis.json'), 'utf8')
).peliculas;

const usuarios = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'listadoUsuarios.json'), 'utf8')
);

// ----- LECTURA -----

function findAllPeliculas() {
  return listadoPelis;
}

function findAllUsuarios() {
  return usuarios;
}

function findPeliculaByTitulo(titulo) {
  return listadoPelis.find(p => p.titulo === titulo);
}

function findUser(usernameOrEmail) {
  return usuarios.find(
    u => u.username === usernameOrEmail || u.email === usernameOrEmail
  );
}

// ----- LOGIN -----

function validateUser(usernameOrEmail, password) {
  const user = findUser(usernameOrEmail);
  return user && user.password === password ? user : null;
}

// ----- PELÍCULAS DEL USUARIO -----

function getPeliculasUsuario(usernameOrEmail) {
  const user = findUser(usernameOrEmail);
  if (!user) return [];

  return user.copies
    .map(copia => listadoPelis.find(p => p.titulo === copia.titulo))
    .filter(Boolean);
}

// ----- ELIMINAR COPIA -----

function saveUsuarios() {
  fs.writeFileSync(
    path.join(__dirname, 'listadoUsuarios.json'),
    JSON.stringify(usuarios, null, 2),
    'utf8'
  );
}

function deleteCopia(usernameOrEmail, titulo) {
  const user = findUser(usernameOrEmail);
  if (!user) return;

  user.copies = user.copies.filter(c => c.titulo !== titulo);
  saveUsuarios();
}

module.exports = {
  findAllPeliculas,
  findAllUsuarios,
  findPeliculaByTitulo,
  validateUser,
  getPeliculasUsuario,
  findUser,
  deleteCopia
};


