const loanSchema = new mongoose.Schema({
    equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    loanDate: Date,
    returnDate: Date,
    returned: { type: Boolean, default: false },
  });
  module.exports = mongoose.model('Loan', loanSchema);