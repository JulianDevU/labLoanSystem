import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const usuarioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del usuario es obligatorio'],
    trim: true
  },
  correo: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo válido']
  },
  contrasena: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  tipo: {
    type: String,
    enum: ['personal', 'administrador'],
    default: 'administrador',
  }
}, {
  timestamps: true,
  versionKey: false
});

// Middleware para hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.contrasena = await bcrypt.hash(this.contrasena, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// Método para comparar contraseñas (nombre compatible con el controlador)
usuarioSchema.methods.verificarContrasena = function(contrasenaIngresada) {
  // Permite usar tanto promesa como callback
  return bcrypt.compare(contrasenaIngresada, this.contrasena);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
