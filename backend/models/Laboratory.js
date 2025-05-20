import mongoose from 'mongoose';
const { Schema } = mongoose;

const laboratorioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del laboratorio es obligatorio'],
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'El identificador del laboratorio (slug) es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Laboratorio = mongoose.model('Laboratorio', laboratorioSchema);

export default Laboratorio;
