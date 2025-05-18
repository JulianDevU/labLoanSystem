import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// URL de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Opciones de conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Función para conectar a la base de datos
export const conectarDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('Conexión a MongoDB establecida con éxito');
    return mongoose.connection;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// Función para cerrar la conexión
export const cerrarConexion = async () => {
  try {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada con éxito');
  } catch (error) {
    console.error('Error al cerrar la conexión a MongoDB:', error.message);
  }
};

export default { conectarDB, cerrarConexion };