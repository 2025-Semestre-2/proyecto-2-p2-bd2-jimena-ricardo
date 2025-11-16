const { getConnection, sql } = require('../config/database');

const inventariosController = {
  getInventarios: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { page = 1, pageSize = 50, filtroNombre, filtroGrupo, cantidadMin } = req.query;

      const result = await pool.request()
        .input('PageNumber', sql.Int, parseInt(page))
        .input('PageSize', sql.Int, parseInt(pageSize))
        .input('FiltroNombre', sql.NVarChar(100), filtroNombre || null)
        .input('FiltroGrupo', sql.NVarChar(100), filtroGrupo || null)
        .input('CantidadMin', sql.Int, cantidadMin ? parseInt(cantidadMin) : null)
        .execute('sp_GetInventarios');

      // Obtener total
      const totalResult = await pool.request()
        .input('FiltroNombre', sql.NVarChar(100), filtroNombre || null)
        .input('FiltroGrupo', sql.NVarChar(100), filtroGrupo || null)
        .input('CantidadMin', sql.Int, cantidadMin ? parseInt(cantidadMin) : null)
        .execute('sp_GetTotalInventarios');

      res.json({
        inventarios: result.recordset,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: totalResult.recordset[0].Total
        }
      });
    } catch (error) {
      console.error('Error en getInventarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getProductoDetalles: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { id } = req.params;

      const result = await pool.request()
        .input('StockItemID', sql.Int, parseInt(id))
        .execute('sp_GetProductoDetalles');

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error en getProductoDetalles:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  createProducto: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const {
        StockItemName, SupplierID, ColorID, UnitPackageID, OuterPackageID,
        QuantityPerOuter, Brand, Size, TaxRate, UnitPrice, RecommendedRetailPrice,
        LeadTimeDays, Barcode, IsChillerStock, TypicalWeightPerUnit,
        MarketingComments, InternalComments
      } = req.body;

      const result = await pool.request()
        .input('StockItemName', sql.NVarChar(100), StockItemName)
        .input('SupplierID', sql.Int, SupplierID)
        .input('ColorID', sql.Int, ColorID)
        .input('UnitPackageID', sql.Int, UnitPackageID)
        .input('OuterPackageID', sql.Int, OuterPackageID)
        .input('QuantityPerOuter', sql.Int, QuantityPerOuter)
        .input('Brand', sql.NVarChar(50), Brand)
        .input('Size', sql.NVarChar(20), Size)
        .input('TaxRate', sql.Decimal(18, 3), TaxRate)
        .input('UnitPrice', sql.Decimal(18, 2), UnitPrice)
        .input('RecommendedRetailPrice', sql.Decimal(18, 2), RecommendedRetailPrice)
        .input('LeadTimeDays', sql.Int, LeadTimeDays)
        .input('Barcode', sql.NVarChar(50), Barcode)
        .input('IsChillerStock', sql.Bit, IsChillerStock)
        .input('TypicalWeightPerUnit', sql.Decimal(18, 3), TypicalWeightPerUnit)
        .input('MarketingComments', sql.NVarChar(sql.MAX), MarketingComments)
        .input('InternalComments', sql.NVarChar(sql.MAX), InternalComments)
        .execute('sp_CreateProducto');

      res.json({
        success: true,
        newProductId: result.recordset[0].NewStockItemID
      });
    } catch (error) {
      console.error('Error en createProducto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  updateProducto: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { id } = req.params;
      const updateFields = req.body;

      const result = await pool.request()
        .input('StockItemID', sql.Int, parseInt(id))
        .input('StockItemName', sql.NVarChar(100), updateFields.StockItemName || null)
        .input('SupplierID', sql.Int, updateFields.SupplierID || null)
        .input('ColorID', sql.Int, updateFields.ColorID || null)
        .input('UnitPackageID', sql.Int, updateFields.UnitPackageID || null)
        .input('OuterPackageID', sql.Int, updateFields.OuterPackageID || null)
        .input('QuantityPerOuter', sql.Int, updateFields.QuantityPerOuter || null)
        .input('Brand', sql.NVarChar(50), updateFields.Brand || null)
        .input('Size', sql.NVarChar(20), updateFields.Size || null)
        .input('TaxRate', sql.Decimal(18, 3), updateFields.TaxRate || null)
        .input('UnitPrice', sql.Decimal(18, 2), updateFields.UnitPrice || null)
        .input('RecommendedRetailPrice', sql.Decimal(18, 2), updateFields.RecommendedRetailPrice || null)
        .input('LeadTimeDays', sql.Int, updateFields.LeadTimeDays || null)
        .input('Barcode', sql.NVarChar(50), updateFields.Barcode || null)
        .input('IsChillerStock', sql.Bit, updateFields.IsChillerStock || null)
        .input('TypicalWeightPerUnit', sql.Decimal(18, 3), updateFields.TypicalWeightPerUnit || null)
        .input('MarketingComments', sql.NVarChar(sql.MAX), updateFields.MarketingComments || null)
        .input('InternalComments', sql.NVarChar(sql.MAX), updateFields.InternalComments || null)
        .execute('sp_UpdateProducto');

      res.json({
        success: true,
        filasAfectadas: result.recordset[0].FilasAfectadas
      });
    } catch (error) {
      console.error('Error en updateProducto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  deleteProducto: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { id } = req.params;

      const result = await pool.request()
        .input('StockItemID', sql.Int, parseInt(id))
        .execute('sp_DeleteProducto');

      res.json({
        success: true,
        eliminado: result.recordset[0].Eliminado
      });
    } catch (error) {
      console.error('Error en deleteProducto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = inventariosController;