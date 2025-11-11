const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.get('/', ventasController.getVentas);
router.get('/total', ventasController.getTotalVentas);
router.get('/:id', ventasController.getVentaById);

module.exports = router;