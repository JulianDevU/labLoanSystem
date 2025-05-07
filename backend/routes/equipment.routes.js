const router = require('express').Router();
const controller = require('../controllers/equipment.controller');
router.get('/', controller.getAll);
router.post('/', controller.add);
module.exports = router;