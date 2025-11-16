const express = require('express');
const router = express.Router();
const inventariosController = require('../controllers/inventariosController');

router.get('/', inventariosController.getInventarios);
router.get('/:id', inventariosController.getProductoDetalles);
router.post('/', inventariosController.createProducto);
router.put('/:id', inventariosController.updateProducto);
router.delete('/:id', inventariosController.deleteProducto);

module.exports = router;