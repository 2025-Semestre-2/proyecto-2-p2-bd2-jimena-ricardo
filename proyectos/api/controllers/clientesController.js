const { poolPromise } = require('../config/database');

exports.getClientes = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      tamanoPagina = 50, 
      nombre, 
      categoria, 
      metodoEntrega 
    } = req.query;
    
    const pool = await poolPromise;
    const request = pool.request();
    
    // Parámetros de paginación
    request.input('PageNumber', parseInt(pagina));
    request.input('PageSize', parseInt(tamanoPagina));
    
    // Parámetros de filtro
    if (nombre) request.input('FiltroNombre', nombre);
    if (categoria) request.input('FiltroCategoria', categoria);
    if (metodoEntrega) request.input('FiltroMetodoEntrega', metodoEntrega);
    
    const result = await request.execute('sp_GetClientes');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getTotalClientes = async (req, res) => {
  try {
    const { nombre, categoria, metodoEntrega } = req.query;
    const pool = await poolPromise;
    
    const request = pool.request();
    if (nombre) request.input('FiltroNombre', nombre);
    if (categoria) request.input('FiltroCategoria', categoria);
    if (metodoEntrega) request.input('FiltroMetodoEntrega', metodoEntrega);
    
    const result = await request.execute('sp_GetTotalClientes');
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error en getTotalClientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('CustomerID', parseInt(id))
      .execute('sp_GetClienteDetalles');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error en getClienteById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};