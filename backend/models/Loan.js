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
  equipos_devueltos: [{
    equipo_id: {
      type: Schema.Types.ObjectId,
      ref: 'Equipo',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  nota_devolucion: {
    type: String,
    trim: true,
    default: ''
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
    trim: true,
    required: [true, 'La evidencia fotografica es obligatoria']
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

// Índices
prestamoSchema.index({ numero_identificacion: 1, estado: 1 });
prestamoSchema.index({ 'equipos.equipo_id': 1, estado: 1 });
prestamoSchema.index({ fecha_devolucion: 1, estado: 1 });

// CAMBIO 1: Validación personalizada con margen de tiempo
prestamoSchema.pre('validate', function(next) {
  if (!this.equipos || this.equipos.length === 0) {
    this.invalidate('equipos', 'Debe seleccionar al menos un equipo');
  }
  
  // NUEVA VALIDACIÓN: Verificar que la fecha de devolución sea futura
  if (this.fecha_devolucion) {
    const ahora = new Date();
    const fechaDevolucion = new Date(this.fecha_devolucion);
    
    // Agregar margen de 10 minutos para evitar problemas de sincronización
    const margenMinutos = 10 * 60 * 1000; // 10 minutos en milisegundos
    const fechaLimite = new Date(ahora.getTime() - margenMinutos);
    
    if (fechaDevolucion < fechaLimite) {
      this.invalidate('fecha_devolucion', 'La fecha de devolución debe ser posterior a la fecha actual');
    }
  }
  
  next();
});

// CAMBIO 2: Método mejorado para verificar vencimiento
prestamoSchema.methods.estaVencido = function() {
  if (this.estado === 'devuelto') return false;
  
  const ahora = new Date();
  const fechaDevolucion = new Date(this.fecha_devolucion);
  
  return fechaDevolucion < ahora;
};

// CAMBIO 3: Middleware mejorado para actualizar estado
prestamoSchema.pre('save', function(next) {
  if (this.fecha_devolucion_real) {
    this.estado = 'devuelto';
  } else if (this.estaVencido() && this.estado === 'activo') {
    this.estado = 'vencido';
  }
  next();
});

const Prestamo = mongoose.model('Prestamo', prestamoSchema);

export default Prestamo;