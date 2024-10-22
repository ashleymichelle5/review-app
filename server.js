require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reviewController = require('./controllers/reviewController');
const authMiddleware = require('./middleware/auth');

const app = express();

// Conectar a la base de datos
connectDB();

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
console.log('Static files directory:', path.join(__dirname, 'public'));

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Aplicar el middleware de autenticación globalmente
app.use(authMiddleware);

// Rutas
app.use('/', userRoutes);
app.use('/reviews', reviewRoutes);

// Ruta para la página de inicio
app.get('/', async (req, res) => {
  console.log('Attempting to render home page');
  try {
    const latestReviews = await reviewController.getLatestReviews();
    res.render('home', { title: 'Home', latestReviews });
  } catch (error) {
    console.error('Error fetching latest reviews:', error);
    res.status(500).render('error', { message: 'Error fetching latest reviews', error });
  }
});

// Manejo de errores 404
app.use((req, res, next) => {
  console.log('404 - Page not found:', req.url);
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', { title: 'Server Error', message: 'An unexpected error occurred', error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;