import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Función para generar token JWT
// Usar la variable correcta del .env: JWT_EXPIRE
export const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE // Debe ser JWT_EXPIRE, no JWT_EXPIRES_IN
  });
};

// Función para eliminar archivo
export const eliminarArchivo = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error al eliminar archivo:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Función para formatear fecha
export const formatearFecha = (fecha) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(fecha).toLocaleDateString('es-ES', options);
};

// Función para verificar si un préstamo está vencido
export const estaVencido = (fechaDevolucion) => {
  return new Date() > new Date(fechaDevolucion);
};

// Función para calcular días restantes
export const calcularDiasRestantes = (fechaDevolucion) => {
  const hoy = new Date();
  const fechaDev = new Date(fechaDevolucion);
  const diferencia = fechaDev - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

// Función para generar código único
export const generarCodigo = (longitud = 8) => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < longitud; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

export default {
  generarToken,
  eliminarArchivo,
  formatearFecha,
  estaVencido,
  calcularDiasRestantes,
  generarCodigo
};