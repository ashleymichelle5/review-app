const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Crear nuevo usuario
    const user = new User({ username, email, password });
    await user.save();

    // Generar token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Establecer el token en una cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // maxAge: 1 hora

    // Redirigir a la página de creación de reseña
    res.redirect('/reviews/create');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error in registration', error: error.message });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Establecer el token en una cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // maxAge: 1 hora

    res.redirect('/'); // Redirigir a la página de inicio después del login
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error in login', error: error.message });
  }
};

// Cerrar sesión
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};