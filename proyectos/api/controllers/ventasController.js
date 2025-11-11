const { poolPromise } = require('../config/database');

exports.getVentas = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      tamanoPagina = 50,
      cliente, 
      fechaInicio, 
      fechaFin, 
      metodoEntrega,
      montoMin, 
      montoMax 
    } = req.query;
    
    const pool = await poolPromise;
    const request = pool.request();
    
    // Parámetros de paginación
    request.input('PageNumber', parseInt(pagina));
    request.input('PageSize', parseInt(tamanoPagina));
    
    // Parámetros de filtro
    if (cliente) request.input('FiltroCliente', cliente);
    if (fechaInicio) request.input('FechaInicio', fechaInicio);
    if (fechaFin) request.input('FechaFin', fechaFin);
    if (metodoEntrega) request.input('MetodoEntrega', metodoEntrega);
    if (montoMin) request.input('MontoMin', parseFloat(montoMin));
    if (montoMax) request.input('MontoMax', parseFloat(montoMax));
    
    const result = await request.execute('sp_GetVentas');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en getVentas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getTotalVentas = async (req, res) => {
  try {
    const { 
      cliente, 
      fechaInicio, 
      fechaFin, 
      metodoEntrega,
      montoMin, 
      montoMax 
    } = req.query;
    
    const pool = await poolPromise;
    const request = pool.request();
    
    // Parámetros de filtro
    if (cliente) request.input('FiltroCliente', cliente);
    if (fechaInicio) request.input('FechaInicio', fechaInicio);
    if (fechaFin) request.input('FechaFin', fechaFin);
    if (metodoEntrega) request.input('MetodoEntrega', metodoEntrega);
    if (montoMin) request.input('MontoMin', parseFloat(montoMin));
    if (montoMax) request.input('MontoMax', parseFloat(montoMax));
    
    const result = await request.execute('sp_GetTotalVentas');
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error en getTotalVentas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('InvoiceID', parseInt(id))
      .execute('sp_GetVentaDetalles');
    
    if (result.recordsets.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    const [encabezado, detalles] = result.recordsets;
    res.json({
      encabezado: encabezado[0] || {},
      detalles: detalles || []
    });
  } catch (error) {
    console.error('Error en getVentaById:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};