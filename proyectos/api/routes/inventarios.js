const express = require('express');
const router = express.Router();
const inventariosController = require('../controllers/inventariosController');

router.get('/', inventariosController.getInventarios);
router.get('/total', inventariosController.getTotalInventarios);
router.get('/:id', inventariosController.getProductoById);

module.exports = router;