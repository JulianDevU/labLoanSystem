const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificacionSchema = new Schema({
  usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },
  mensaje: {
    type: String,
    required: [true, 'El mensaje es obligatorio'],
    trim: true
  },
  leido: {
    type: Boolean,
    default: false
  },
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índice para mejorar el rendimiento de consultas por usuario y estado de lectura
notificacionSchema.index({ usuario_id: 1, leido: 1 });

const Notificacion = mongoose.model('Notificacion', notificacionSchema);

module.exports = Notificacion;