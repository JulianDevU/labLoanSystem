import mongoose from 'mongoose';
const { Schema } = mongoose;

const prestamoSchema = new Schema({
  usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },
  equipo_id: {
    type: Schema.Types.ObjectId,
    ref: 'Equipo',
    required: [true, 'El equipo es obligatorio']
  },
  fecha_prestamo: {
    type: Date,
    required: [true, 'La fecha de préstamo es obligatoria'],
    default: Date.now
  },
  fecha_devolucion: {
    type: Date,
    required: [true, 'La fecha de devolución planificada es obligatoria']
  },
  fecha_devolucion_real: {
    type: Date,
    default: null
  },
  estado: {
    type: String,
    enum: ['activo', 'devuelto', 'vencido'],
    default: 'activo'
  },
  evidencia_foto: {
    type: String,
    trim: true
  },
  laboratorio_id: {
    type: Schema.Types.ObjectId,
    ref: 'Laboratorio',
    required: [true, 'El laboratorio es obligatorio']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para mejorar el rendimiento de consultas comunes
prestamoSchema.index({ usuario_id: 1, estado: 1 });
prestamoSchema.index({ equipo_id: 1, estado: 1 });
prestamoSchema.index({ fecha_devolucion: 1, estado: 1 });

// Método para verificar si un préstamo está vencido
prestamoSchema.methods.estaVencido = function() {
  if (this.estado === 'devuelto') return false;
  return this.fecha_devolucion < new Date();
};

// Middleware para actualizar el estado antes de guardar
prestamoSchema.pre('save', function(next) {
  if (this.fecha_devolucion_real) {
    this.estado = 'devuelto';
  } else if (this.fecha_devolucion < new Date() && this.estado === 'activo') {
    this.estado = 'vencido';
  }
  next();
});

const Prestamo = mongoose.model('Prestamo', prestamoSchema);

export default Prestamo;