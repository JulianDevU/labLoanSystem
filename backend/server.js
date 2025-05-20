import app from './app.js';
import { conectarDB } from './config/db.js';
import dotenv from 'dotenv';
import { createInitialLaboratories } from './utils/generateLabs.js'

// Cargar variables de entorno
dotenv.config();

// Puerto
const PORT = process.env.PORT;

// Iniciar servidor
const iniciarServidor = async () => {
  try {

    await conectarDB();

    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    
    await createInitialLaboratories();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

iniciarServidor();

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado:', err);
  process.exit(1);
});