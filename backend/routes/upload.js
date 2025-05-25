import express from 'express';
import upload from '../middleware/upload.js';

const router = express.Router();

// Endpoint para subir una imagen
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Devuelve la ruta relativa de la imagen
  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
