const Review = require('../models/Review');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// Crear una nueva reseña
exports.createReview = async (req, res) => {
  try {
    const { product, rating, details, pros, cons } = req.body;
    const userId = req.user.userId;

    // Manejar la carga de imágenes
    const images = req.files ? req.files.map(file => file.filename) : [];

    const review = new Review({
      product,
      rating,
      details,
      pros,
      cons,
      user: userId,
      images
    });

    await review.save();

    // Añadir la reseña al usuario
    await User.findByIdAndUpdate(userId, { $push: { reviews: review._id } });

    res.redirect(`/reviews/${review._id}`);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).render('error', { message: 'Error creating review', error: error.message });
  }
};

// Obtener todas las reseñas
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'username').sort({ createdAt: -1 });
    res.render('reviews', { reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).render('error', { message: 'Error fetching reviews', error: error.message });
  }
};

// Obtener una reseña específica
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('user', 'username');
    if (!review) {
      return res.status(404).render('404', { message: 'Review not found' });
    }

// Traigo el ID del usuario desde el Token
    const currentUserId = req.user ? req.user.userId : null;

// Verifico si el usuario actual es dueño de la reseña -- tiene que ser el mismo tipo de dato
   const isOwner = currentUserId && currentUserId.toString() === review.user._id.toString();

    res.render('reviewDetail', { 
      review,
      currentUser: { userId: currentUserId},
      isOwner

     });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).render('error', { message: 'Error fetching review', error: error.message });
  }
};

// Actualizar una reseña
exports.updateReview = async (req, res) => {
  try {
    const { product, rating, details, pros, cons } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).render('404', { message: 'Review not found' });
    }

    // Verificar que el usuario es el propietario de la reseña
    if (review.user.toString() !== req.user.userId) {
      return res.status(401).render('error', { message: 'Not authorized to update this review' });
    }

    // Actualizar los campos de la reseña
    review.product = product;
    review.rating = rating;
    review.details = details;
    review.pros = pros;
    review.cons = cons;
	
    // Manejar la actualización de imágenes
    if (req.files && req.files.length > 0) {
      // Eliminar imágenes antiguas
      await Promise.all(review.images.map(image => 
        fs.unlink(path.join(__dirname, '../public/uploads', image)).catch(err => 
          console.error('Error deleting image:', err)
        )
      ));

      // Agregar nuevas imágenes
      review.images = req.files.map(file => file.filename);
    }

    await review.save();

    res.redirect(`/reviews/${review._id}`);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).render('error', { message: 'Error updating review', error: error.message });
  }
};

// Añadir un nuevo método para mostrar el formulario de edición
exports.showEditForm = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).render('404', { message: 'Review not found' });
    }
    if (review.user.toString() !== req.user.userId) {
      return res.status(401).render('error', { message: 'Not authorized to edit this review' });
    }
    res.render('editReview', { review });
  } catch (error) {
    console.error('Error fetching review for edit:', error);
    res.status(500).render('error', { message: 'Error fetching review', error: error.message });
  }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).render('404', { message: 'Review not found' });
    }

    // Verificar que el usuario es el propietario de la reseña
    if (review.user.toString() !== req.user.userId) {
      return res.status(401).render('error', { message: 'Not authorized to delete this review' });
    }

    // Eliminar imágenes asociadas
    await Promise.all(review.images.map(image => 
      fs.unlink(path.join(__dirname, '../public/uploads', image)).catch(err => 
        console.error('Error deleting image:', err)
      )
    ));
	
    // Usar deleteOne() en lugar de remove()
    await Review.deleteOne({ _id: review._id });

    // Eliminar la referencia de la reseña en el usuario
    await User.findByIdAndUpdate(req.user.userId, { $pull: { reviews: req.params.id } });

    res.redirect('/reviews');
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).render('error', { message: 'Error deleting review', error: error.message });
  }
};

// Obtener las últimas 4 reseñas
exports.getLatestReviews = async () => {
  try {
    const latestReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('user', 'username');

    return latestReviews;
  } catch (error) {
    console.error('Error fetching latest reviews:', error);
    throw error;
  }
};