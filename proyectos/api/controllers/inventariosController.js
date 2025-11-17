const { getConnection, sql } = require('../config/database');

const inventariosController = {
  getOpcionesCombobox: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetOpcionesCombobox');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getOpcionesCombobox:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getInventarios: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetInventarios');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getInventarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getProductoDetalles: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('ProductoID', sql.Int, id)
        .execute('sp_GetProductoDetalles');
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error en getProductoDetalles:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getProductoEdicion: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('ProductoID', sql.Int, id)
        .execute('sp_GetProductoEdicion');
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error en getProductoEdicion:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  createProducto: async (req, res) => {
    try {
      const { nombre, descripcion, precio, stock, categoriaId } = req.body;
      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('Nombre', sql.NVarChar, nombre)
        .input('Descripcion', sql.NVarChar, descripcion)
        .input('Precio', sql.Decimal, precio)
        .input('Stock', sql.Int, stock)
        .input('CategoriaID', sql.Int, categoriaId)
        .execute('sp_CreateProducto');
      res.status(201).json({ message: 'Producto creado exitosamente', id: result.recordset[0].ID });
    } catch (error) {
      console.error('Error en createProducto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  updateProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, stock, categoriaId } = req.body;
      const pool = await getConnection(req.database);
      await pool.request()
        .input('ProductoID', sql.Int, id)
        .input('Nombre', sql.NVarChar, nombre)
        .input('Descripcion', sql.NVarChar, descripcion)
        .input('Precio', sql.Decimal, precio)
        .input('Stock', sql.Int, stock)
        .input('CategoriaID', sql.Int, categoriaId)
        .execute('sp_UpdateProducto');
      res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
      console.error('Error en updateProducto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  deleteProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection(req.database);
      await pool.request()
        .input('ProductoID', sql.Int, id)
        .execute('sp_DeleteProducto');
      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error('Error en deleteProducto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = inventariosController;