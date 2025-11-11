const { poolPromise } = require('../config/database');

exports.getFiltrosClientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetFiltrosClientes');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getFiltrosClientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getFiltrosProveedores = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetFiltrosProveedores');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getFiltrosProveedores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getFiltrosInventarios = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetFiltrosInventarios');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getFiltrosInventarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getFiltrosVentas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetFiltrosVentas');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getFiltrosVentas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getFiltrosEstadisticas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetFiltrosEstadisticas');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getFiltrosEstadisticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getAniosDisponibles = async (req, res) => {
  try {
    const { modulo } = req.query;
    const pool = await poolPromise;
    const request = pool.request();
    if (modulo) request.input('Modulo', modulo);
    const result = await request.execute('sp_GetAniosDisponibles');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getAniosDisponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getCiudades = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetCiudades');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getCiudades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getMetodosEntrega = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetMetodosEntrega');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getMetodosEntrega:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};