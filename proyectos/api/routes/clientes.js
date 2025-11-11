const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.getClientes);
router.get('/total', clientesController.getTotalClientes);
router.get('/:id', clientesController.getClienteById);

module.exports = router;