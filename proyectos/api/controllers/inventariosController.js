const { poolPromise } = require('../config/database');

exports.getInventarios = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      tamanoPagina = 50, 
      nombre, 
      grupo, 
      cantidad 
    } = req.query;
    
    const pool = await poolPromise;
    const request = pool.request();
    
    // Parámetros de paginación
    request.input('PageNumber', parseInt(pagina));
    request.input('PageSize', parseInt(tamanoPagina));
    
    // Parámetros de filtro
    if (nombre) request.input('FiltroNombre', nombre);
    if (grupo) request.input('FiltroGrupo', grupo);
    if (cantidad) request.input('CantidadMin', parseInt(cantidad));
    
    const result = await request.execute('sp_GetInventarios');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getInventarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getTotalInventarios = async (req, res) => {
  try {
    const { nombre, grupo, cantidad } = req.query;
    const pool = await poolPromise;
    
    const request = pool.request();
    if (nombre) request.input('FiltroNombre', nombre);
    if (grupo) request.input('FiltroGrupo', grupo);
    if (cantidad) request.input('CantidadMin', parseInt(cantidad));
    
    const result = await request.execute('sp_GetTotalInventarios');
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error en getTotalInventarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('StockItemID', parseInt(id))
      .execute('sp_GetProductoDetalles');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error en getProductoById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};