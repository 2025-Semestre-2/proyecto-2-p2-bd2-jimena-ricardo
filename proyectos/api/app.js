import express from 'express';
import cors from 'cors'
import sql from 'mssql';
import { connString } from './config.js'

// inParams: [ [parameterName, type, value], ... ].
// outParam: [parameterName, type].
async function executeProcedure(name, inParams, outParam) {
  const pool = await sql.connect(connString);
  const request = new sql.Request(pool);

  inParams.forEach(param => {
    request.input(...param);
  });
  if (outParam.length != 0) {
    request.output(...outParam);
  }
  const result = await request.execute(name);
  return result.recordset;
}

const app = express();
app.use(cors());
const port = 3000;

// ---------- TOTALS ROUTES ----------

app.get('/total-customers', async (_, res) => {
  const result = await executeProcedure('getTotalCustomers', [], []);
  res.json(result[0].Total);
});

app.get('/total-suppliers', async (_, res) => {
  const result = await executeProcedure('getTotalSuppliers', [], []);
  res.json(result[0].Total);
});

app.get('/total-stock', async (_, res) => {
  const result = await executeProcedure('getTotalStock', [], []);
  res.json(result[0].Total);
});

app.get('/total-invoices', async (_, res) => {
  const result = await executeProcedure('getTotalInvoices', [], []);
  res.json(result[0].Total);
});

// ---------- LISTS ROUTES ----------

app.get('/customers-list', async (req, res) => {
  const { pageNumber, pageSize, customer, category } = req.query;
  const inputParams = [
    ['pageNumber', sql.Int, pageNumber],
    ['pageSize', sql.Int, pageSize],
    ['customer', sql.NVarChar(100), `%${customer}%`],
    ['category', sql.NVarChar(50), `%${category}%`]
  ];
  res.json(await executeProcedure('getCustomersList', inputParams, []));
});

app.get('/suppliers-list', async (req, res) => {
  const { pageNumber, pageSize, supplier, category } = req.query;
  const inputParams = [
    ['pageNumber', sql.Int, pageNumber],
    ['pageSize', sql.Int, pageSize],
    ['supplier', sql.NVarChar(100), `%${supplier}%`],
    ['category', sql.NVarChar(50), `%${category}%`]
  ];
  res.json(await executeProcedure('getSuppliersList', inputParams, []));
});

app.get('/stock-list', async (req, res) => {
  const { pageNumber, pageSize, product, group } = req.query;
  const inputParams = [
    ['pageNumber', sql.Int, pageNumber],
    ['pageSize', sql.Int, pageSize],
    ['product', sql.NVarChar(100), `%${product}%`],
    ['group', sql.NVarChar(50), `%${group}%`]
  ];
  res.json(await executeProcedure('getStockList', inputParams, []));
});

app.get('/invoices-list', async (req, res) => {
  const { pageNumber, pageSize, customer } = req.query;
  const inputParams = [
    ['pageNumber', sql.Int, pageNumber],
    ['pageSize', sql.Int, pageSize],
    ['customer', sql.NVarChar(100), `%${customer}%`],
  ];
  res.json(await executeProcedure('getInvoicesList', inputParams, []));
});

// ---------- STATISTICS ROUTES ----------

app.get('/purchase-order-stat', async (req, res) => {
  const { pageNumber, pageSize, filtro } = req.query;
  const inputParams = [
    ['pageNumber', sql.Int, pageNumber], 
    ['pageSize', sql.Int, pageSize],
    ['Filtro', sql.NVarChar(100), filtro || null]
  ];
  res.json(await executeProcedure('GetPurchaseOrderStat', inputParams, []));
});

app.get('/invoice-stat', async (req, res) => {
  const { pageNumber, pageSize, filtro } = req.query;
  const inputParams = [
    ['pageNumber', sql.Int, pageNumber], 
    ['pageSize', sql.Int, pageSize],
    ['Filtro', sql.NVarChar(100), filtro || null]
  ];
  res.json(await executeProcedure('GetInvoiceStat', inputParams, []));
});

app.get('/products-stat', async (req, res) => {
  const { anio } = req.query;
  const inputParams = [['Anio', sql.Int, anio || 2023]];
  res.json(await executeProcedure('GetTop5ProductsStat', inputParams, []));
});

app.get('/customers-stat', async (req, res) => {
  const { anioInicio, anioFin } = req.query;
  const inputParams = [
    ['AnioInicio', sql.Int, anioInicio || 2020],
    ['AnioFin', sql.Int, anioFin || 2023]
  ];
  res.json(await executeProcedure('GetTop5CustomersStat', inputParams, []));
});

app.get('/suppliers-stat', async (req, res) => {
  const { anioInicio, anioFin } = req.query;
  const inputParams = [
    ['AnioInicio', sql.Int, anioInicio || 2020],
    ['AnioFin', sql.Int, anioFin || 2023]
  ];
  res.json(await executeProcedure('GetTop5SuppliersStat', inputParams, []));
});

// ---------- CATALOG ROUTES ----------

app.get('/customer-categories', async (_, res) => {
  res.json(await executeProcedure('GetCustomerCategories', [], []));
});

app.get('/customer-delivery-methods', async (_, res) => {
  res.json(await executeProcedure('GetCustomerDeliveryMethods', [], []));
});

app.get('/delivery-methods', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetMetodosEntrega', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching delivery methods:', error);
    res.status(500).json({ error: 'Error al cargar los métodos de entrega' });
  }
});

// ---------- DETAILS ROUTES ----------

app.get('/customer-details', async (req, res) => {
  const { customerId } = req.query;
  const inputParams = [['customerID', sql.Int, customerId]];
  res.json(await executeProcedure('getCustomerDetails', inputParams, []));
});

app.get('/supplier-details', async (req, res) => {
  const { supplierId } = req.query;
  const inputParams = [['supplierID', sql.Int, supplierId]];
  res.json(await executeProcedure('getSupplierDetails', inputParams, []));
});

app.get('/stock-details', async (req, res) => {
  const { productId } = req.query;
  const inputParams = [['productID', sql.Int, productId]];
  res.json(await executeProcedure('getProductDetails', inputParams, []));
});

// ---------- FILTERS ROUTES ----------

app.get('/filters/customers', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetFiltrosClientes', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching customer filters:', error);
    res.status(500).json({ error: 'Error al cargar los filtros de clientes' });
  }
});

app.get('/filters/suppliers', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetFiltrosProveedores', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching supplier filters:', error);
    res.status(500).json({ error: 'Error al cargar los filtros de proveedores' });
  }
});

app.get('/filters/inventory', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetFiltrosInventarios', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching inventory filters:', error);
    res.status(500).json({ error: 'Error al cargar los filtros de inventarios' });
  }
});

app.get('/filters/sales', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetFiltrosVentas', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching sales filters:', error);
    res.status(500).json({ error: 'Error al cargar los filtros de ventas' });
  }
});

app.get('/filters/statistics', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetFiltrosEstadisticas', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching statistics filters:', error);
    res.status(500).json({ error: 'Error al cargar los filtros de estadísticas' });
  }
});

app.get('/available-years', async (req, res) => {
  try {
    const { modulo } = req.query;
    const inputParams = modulo ? [['Modulo', sql.NVarChar(50), modulo]] : [];
    const result = await executeProcedure('sp_GetAniosDisponibles', inputParams, []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching available years:', error);
    res.status(500).json({ error: 'Error al cargar los años disponibles' });
  }
});

app.get('/cities', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetCiudades', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Error al cargar las ciudades' });
  }
});

app.get('/delivery-methods', async (_, res) => {
  try {
    const result = await executeProcedure('sp_GetMetodosEntrega', [], []);
    res.json(result);
  } catch (error) {
    console.error('Error fetching delivery methods:', error);
    res.status(500).json({ error: 'Error al cargar los métodos de entrega' });
  }
});

// Start the server and have it listen on the specified port
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
