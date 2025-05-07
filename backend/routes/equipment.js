const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');

router
  .route('/')
  .get(getEquipment)
  .post(protect, authorize('admin', 'lab_assistant'), createEquipment);

router
  .route('/:id')
  .get(getEquipment)
  .put(protect, authorize('admin', 'lab_assistant'), updateEquipment)
  .delete(protect, authorize('admin'), deleteEquipment);

module.exports = router;