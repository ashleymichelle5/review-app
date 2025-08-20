const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuración de multer para la carga de imágenes
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Ruta para mostrar todas las reseñas
router.get('/', reviewController.getAllReviews);

// Ruta para mostrar el formulario de creación de reseña
router.get('/create', auth, (req, res) => {
  res.render('createReview', { title: 'Create Review' });
});

// Ruta para procesar la creación de una reseña
router.post('/', auth, upload.array('images', 5), reviewController.createReview);

// Ruta para mostrar una reseña específica
router.get('/:id', reviewController.getReview);

// Ruta para mostrar el formulario de edición de una reseña
router.get('/:id/edit', auth, reviewController.showEditForm);

// Ruta para procesar la actualización de una reseña
router.put('/:id', auth, upload.array('images', 5), reviewController.updateReview);

// Ruta para eliminar una reseña
router.delete('/:id', auth, reviewController.deleteReview);

router.get('/create', (req, res) => {
  if (!req.user){
    return res.redirect('/login');
  }
  res.render('createReview', {title:'Create Review'});
});

module.exports = router;