const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtener el token de la cookie
  const token = req.cookies.token;

  // Verificar si no hay token
  if (!token) {
    req.user = null; // Establece req.user como null si no hay token
    return next();
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Añadir el usuario del payload decodificado a la request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).redirect('/login');
  }
};
