const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');

router.get('/compras', estadisticasController.getEstadisticasCompras);
router.get('/ventas', estadisticasController.getEstadisticasVentas);
router.get('/top5-productos', estadisticasController.getTop5Productos);
router.get('/top5-clientes', estadisticasController.getTop5Clientes);
router.get('/top5-proveedores', estadisticasController.getTop5Proveedores);

module.exports = router;