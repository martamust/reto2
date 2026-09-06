var express = require('express');
var router = express.Router();
const dataService = require('../data/dataService');

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

/* Página principal */
router.get('/', function(req, res, next) {
  const showcase = ['Blade Runner', 'The Godfather', 'Pulp Fiction', 'Parasite', 'Interstellar'];
  const movies = showcase
    .map(titulo => dataService.findPeliculaByTitulo(titulo))
    .filter(Boolean);
  res.render('index', { movies });
});

/* Página de login */
router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = dataService.validateUser(username, password);

  if (user) {
    req.session.user = user; // usuario completo
    res.redirect('/coleccion');
  } else {
    res.render('login', { error: 'Usuario o contraseña incorrectos' });
  }
});

/* Logout */
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

/* Contacto */
router.get('/contacto', function(req, res) {
  res.render('contacto');
});

/* Página de colección */
router.get('/coleccion', isAuthenticated, function(req, res) {
  const user = dataService.findUser(req.session.user.username);
  req.session.user = user;

  const peliculasUsuario = dataService.getPeliculasUsuario(user.username);
  res.render('coleccion', {
    movies: peliculasUsuario,
    user
  });
});

/* Detalle de película */
router.get('/pelicula/:titulo', isAuthenticated, (req, res) => {
  const titulo = decodeURIComponent(req.params.titulo);
  const pelicula = dataService.findPeliculaByTitulo(titulo);

  if (!pelicula) {
    return res.status(404).render('error', { message: 'Película no encontrada' });
  }

  const user = req.session.user;
  const copiaUsuario = user.copies.find(c => c.titulo === titulo);

  res.render('detalle', {
    pelicula,
    copiaUsuario,
    user
  });
});

/* Eliminar copia (del usuario actual) */
router.post('/pelicula/:titulo/eliminar', isAuthenticated, (req, res) => {
  const titulo = decodeURIComponent(req.params.titulo);

  dataService.deleteCopia(req.session.user.username, titulo);

  req.session.user = dataService.findUser(req.session.user.username);

  res.redirect('/coleccion');
});


/* JSONs */
router.get('/peliculas/json', function(req, res) {
  const pelis = dataService.findAllPeliculas();
  res.json(pelis);
});

router.get('/usuarios/json', isAuthenticated, function(req, res) {
  const usuarios = dataService.findAllUsuarios().map(({ password, ...user }) => user);
  res.json(usuarios);
});

module.exports = router;
