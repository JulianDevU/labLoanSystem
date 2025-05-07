const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  returnLoan,
  getLoansReport,
  exportLoans
} = require('../controllers/loanController');

// Rutas básicas
router
  .route('/')
  .get(protect, getLoans)
  .post(protect, authorize('admin', 'lab_assistant'), createLoan);

router
  .route('/:id')
  .get(protect, getLoan)
  .put(protect, authorize('admin', 'lab_assistant'), updateLoan)
  .delete(protect, authorize('admin'), deleteLoan);

// Rutas adicionales
router.put('/:id/return', protect, authorize('admin', 'lab_assistant'), returnLoan);
router.get('/report', protect, authorize('admin', 'lab_assistant'), getLoansReport);
router.get('/export', protect, authorize('admin', 'lab_assistant'), exportLoans);

module.exports = router;