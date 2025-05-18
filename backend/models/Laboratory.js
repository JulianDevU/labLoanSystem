const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const laboratorioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del laboratorio es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const Laboratorio = mongoose.model('Laboratorio', laboratorioSchema);

module.exports = Laboratorio;