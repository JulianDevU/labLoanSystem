import mongoose from 'mongoose';
const { Schema } = mongoose;

const prestamoSchema = new Schema({
  tipo_beneficiado: {
    type: String,
    enum: ['estudiante', 'docente'],
    required: [true, 'El tipo de beneficiado es obligatorio']
  },
  numero_identificacion: {
    type: String,
    required: [true, 'El número de identificación es obligatorio'],
  },
  nombre_beneficiado: {
    type: String,
    required: [true, 'El nombre del beneficiado es obligatorio'],
  },
  correo_beneficiado: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo válido']
  },
  // CAMBIO: Ahora es un array de equipos con cantidad
  equipos: [{
    equipo_id: {
      type: Schema.Types.ObjectId,
      ref: 'Equipo',
      required: [true, 'El equipo es obligatorio']
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser mayor a 0']
    }
  }],
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
  },
  descripcion: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices actualizados
prestamoSchema.index({ numero_identificacion: 1, estado: 1 });
prestamoSchema.index({ 'equipos.equipo_id': 1, estado: 1 });
prestamoSchema.index({ fecha_devolucion: 1, estado: 1 });

// Validación personalizada para asegurar que hay al menos un equipo
prestamoSchema.pre('validate', function(next) {
  if (!this.equipos || this.equipos.length === 0) {
    this.invalidate('equipos', 'Debe seleccionar al menos un equipo');
  }
  next();
});

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