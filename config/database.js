require('dotenv').config();
const mongoose = require('mongoose');

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    process.exit(1); // Salir del proceso con error
  }
};

module.exports = connectDB;