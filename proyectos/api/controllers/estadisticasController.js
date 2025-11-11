const { poolPromise } = require('../config/database');

exports.getEstadisticasCompras = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      tamanoPagina = 50,
      filtro 
    } = req.query;
    
    const pool = await poolPromise;
    const request = pool.request();
    
    // Parámetros de paginación
    request.input('PageNumber', parseInt(pagina));
    request.input('PageSize', parseInt(tamanoPagina));
    
    // Parámetros de filtro
    if (filtro) request.input('Filtro', filtro);
    
    const result = await request.execute('sp_EstadisticasComprasProveedores');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getEstadisticasCompras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getEstadisticasVentas = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      tamanoPagina = 50,
      filtro 
    } = req.query;
    
    const pool = await poolPromise;
    const request = pool.request();
    
    // Parámetros de paginación
    request.input('PageNumber', parseInt(pagina));
    request.input('PageSize', parseInt(tamanoPagina));
    
    // Parámetros de filtro
    if (filtro) request.input('Filtro', filtro);
    
    const result = await request.execute('sp_EstadisticasVentasClientes');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getEstadisticasVentas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getTop5Productos = async (req, res) => {
  try {
    const { anio } = req.query;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('Anio', parseInt(anio))
      .execute('sp_Top5ProductosGanancia');
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getTop5Productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getTop5Clientes = async (req, res) => {
  try {
    const { anioInicio, anioFin } = req.query;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('AnioInicio', parseInt(anioInicio))
      .input('AnioFin', parseInt(anioFin))
      .execute('sp_Top5ClientesFacturas');
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getTop5Clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getTop5Proveedores = async (req, res) => {
  try {
    const { anioInicio, anioFin } = req.query;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('AnioInicio', parseInt(anioInicio))
      .input('AnioFin', parseInt(anioFin))
      .execute('sp_Top5ProveedoresOrdenes');
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getTop5Proveedores:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};