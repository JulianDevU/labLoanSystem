const mongoose = require('mongoose');
const equipmentSchema = new mongoose.Schema({
  name: String,
  serialNumber: String,
  category: String,
  available: { type: Boolean, default: true },
});
module.exports = mongoose.model('Equipment', equipmentSchema);