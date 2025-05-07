const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Equipment',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  authorizedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Por favor ingrese la cantidad prestada'],
    min: [1, 'Debe prestar al menos 1 unidad']
  },
  loanDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: [true, 'Por favor ingrese la fecha esperada de devolución']
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'lost'],
    default: 'active'
  },
  comments: {
    type: String
  },
  receiptId: {
    type: String,
    unique: true
  }
});

// Generar ID de recibo automáticamente
LoanSchema.pre('save', async function(next) {
  if (!this.receiptId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.receiptId = `L${year}${month}${day}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Loan', LoanSchema);