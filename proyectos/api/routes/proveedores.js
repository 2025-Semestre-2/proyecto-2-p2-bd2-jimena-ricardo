const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/', proveedoresController.getProveedores);
router.get('/total', proveedoresController.getTotalProveedores);
router.get('/:id', proveedoresController.getProveedorById);

module.exports = router;