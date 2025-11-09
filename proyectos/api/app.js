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
  const { pageNumber, pageSize } = req.query;
  const inputParams = [['pageNumber', sql.Int, pageNumber], ['pageSize', sql.Int, pageSize]];
  res.json(await executeProcedure('GetPurchaseOrderStat', inputParams, []));
});

app.get('/invoice-stat', async (req, res) => {
  const { pageNumber, pageSize } = req.query;
  const inputParams = [['pageNumber', sql.Int, pageNumber], ['pageSize', sql.Int, pageSize]];
  res.json(await executeProcedure('GetInvoiceStat', inputParams, []));
});

app.get('/products-stat', async (_, res) => {
  res.json(await executeProcedure('GetTop5ProductsStat', [], []));
});

app.get('/customers-stat', async (_, res) => {
  res.json(await executeProcedure('GetTop5CustomersStat', [], []));
});

app.get('/suppliers-stat', async (_, res) => {
  res.json(await executeProcedure('GetTop5SuppliersStat', [], []));
});

// ---------- CATALOG ROUTES ----------

app.get('/customer-categories', async (_, res) => {
  res.json(await executeProcedure('GetCustomerCategories', [], []));
});

app.get('/customer-delivery-methods', async (_, res) => {
  res.json(await executeProcedure('GetCustomerDeliveryMethods', [], []));
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

// Start the server and have it listen on the specified port
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
