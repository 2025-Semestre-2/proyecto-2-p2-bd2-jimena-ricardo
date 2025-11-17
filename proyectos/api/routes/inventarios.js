
import { Router } from 'express';
import {
  getInventarios,
  getProductoDetalles,
  getProductoEdicion,
  createProducto,
  updateProducto,
  deleteProducto,
  getOpcionesCombobox
} from '../controllers/inventoryController';

const router = Router();

router.get('/opciones', getOpcionesCombobox);
router.get('/', getInventarios);
router.get('/:id', getProductoDetalles);
router.get('/:id/editar', getProductoEdicion);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;