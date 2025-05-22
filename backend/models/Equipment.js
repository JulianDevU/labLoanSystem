import mongoose from 'mongoose';
const { Schema } = mongoose;

const equipoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del equipo es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true
  },
  cantidad_total: {
    type: Number,
    required: [true, 'La cantidad total es obligatoria'],
    min: [0, 'La cantidad total no puede ser negativa']
  },
  numero_serie: {
    type: String,
    trim: true
  },
  cantidad_disponible: {
    type: Number,
    required: [true, 'La cantidad disponible es obligatoria'],
    min: [0, 'La cantidad disponible no puede ser negativa'],
  },
  ubicacion: {
    type: String,
    trim: true
  },
  nota_adicional: {
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

equipoSchema.pre('validate', function (next) {
  if (this.cantidad_disponible > this.cantidad_total) {
    this.invalidate(
      'cantidad_disponible',
      'La cantidad disponible no puede ser mayor que la cantidad total'
    );
  }
  next();
});

const Equipo = mongoose.model('Equipo', equipoSchema);

export default Equipo;