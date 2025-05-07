const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre de equipo'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  code: {
    type: String,
    required: [true, 'Por favor ingrese un código'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Por favor ingrese una categoría'],
    enum: [
      'Mecánica',
      'Electricidad',
      'Óptica',
      'Termodinámica',
      'Electrónica',
      'Instrumentos de medición',
      'Otros'
    ]
  },
  description: {
    type: String,
    required: [true, 'Por favor ingrese una descripción']
  },
  quantity: {
    type: Number,
    required: [true, 'Por favor ingrese la cantidad disponible'],
    min: [0, 'La cantidad no puede ser negativa']
  },
  available: {
    type: Number,
    required: true,
    default: function() {
      return this.quantity;
    }
  },
  location: {
    type: String,
    required: [true, 'Por favor ingrese la ubicación del equipo']
  },
  condition: {
    type: String,
    enum: ['Nuevo', 'Buen estado', 'Regular', 'Requiere mantenimiento'],
    default: 'Buen estado'
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  lastMaintenance: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);