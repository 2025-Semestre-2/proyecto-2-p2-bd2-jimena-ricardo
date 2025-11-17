
import { Request, Response } from 'express';
import sql from 'mssql';

export const getOpcionesCombobox = async (req: Request, res: Response) => {
  try {
    const pool = req.app.locals.db as sql.ConnectionPool;
    
    const [proveedoresResult, coloresResult, tiposPaqueteResult, gruposStockResult] = await Promise.all([
      pool.request().execute('sp_GetProveedoresSeleccion'),
      pool.request().execute('sp_GetColores'),
      pool.request().execute('sp_GetTiposPaquete'),
      pool.request().execute('sp_GetGruposStock')
    ]);

    res.json({
      proveedores: proveedoresResult.recordset || [],
      colores: coloresResult.recordset || [],
      tiposPaquete: tiposPaqueteResult.recordset || [],
      gruposStock: gruposStockResult.recordset || []
    });
  } catch (error) {
    console.error('Error obteniendo opciones:', error);
    res.status(500).json({ 
      error: 'Error al cargar las opciones del formulario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getInventarios = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 50, filtroNombre, filtroGrupo } = req.query;
    const pool = req.app.locals.db as sql.ConnectionPool;

    const request = pool.request();
    request.input('PageNumber', sql.Int, parseInt(page as string));
    request.input('PageSize', sql.Int, parseInt(pageSize as string));
    request.input('FiltroNombre', sql.NVarChar(100), filtroNombre || null);
    request.input('FiltroGrupo', sql.NVarChar(100), filtroGrupo || null);

    const result = await request.execute('sp_GetInventarios');

    res.json({
      inventarios: result.recordset || [],
      pagination: {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        total: result.recordset.length > 0 ? await getTotalInventarios(pool, filtroNombre as string, filtroGrupo as string) : 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo inventarios:', error);
    res.status(500).json({ 
      error: 'Error al cargar los productos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

const getTotalInventarios = async (pool: sql.ConnectionPool, filtroNombre?: string, filtroGrupo?: string): Promise<number> => {
  try {
    const request = pool.request();
    request.input('FiltroNombre', sql.NVarChar(100), filtroNombre || null);
    request.input('FiltroGrupo', sql.NVarChar(100), filtroGrupo || null);

    const result = await request.execute('sp_GetTotalInventarios');
    return result.recordset[0]?.Total || 0;
  } catch (error) {
    console.error('Error obteniendo total de inventarios:', error);
    return 0;
  }
};

export const getProductoDetalles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db as sql.ConnectionPool;

    const request = pool.request();
    request.input('StockItemID', sql.Int, parseInt(id));

    const result = await request.execute('sp_GetProductoDetalles');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error obteniendo detalles del producto:', error);
    res.status(500).json({ 
      error: 'Error al cargar los detalles del producto',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getProductoEdicion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db as sql.ConnectionPool;

    const request = pool.request();
    request.input('StockItemID', sql.Int, parseInt(id));

    const result = await request.execute('sp_GetProductoEdicion');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error obteniendo datos para edición:', error);
    res.status(500).json({ 
      error: 'Error al cargar los datos del producto para editar',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  try {
    const {
      StockItemName,
      SupplierName,
      ColorName,
      UnitPackageName,
      OuterPackageName,
      QuantityPerOuter,
      Brand,
      Size,
      TaxRate,
      UnitPrice,
      RecommendedRetailPrice,
      LeadTimeDays,
      Barcode,
      IsChillerStock,
      TypicalWeightPerUnit,
      MarketingComments,
      InternalComments,
      StockGroupNames
    } = req.body;

    const pool = req.app.locals.db as sql.ConnectionPool;

    const request = pool.request();
    request.input('StockItemName', sql.NVarChar(100), StockItemName);
    request.input('SupplierName', sql.NVarChar(100), SupplierName);
    request.input('ColorName', sql.NVarChar(20), ColorName || null);
    request.input('UnitPackageName', sql.NVarChar(50), UnitPackageName);
    request.input('OuterPackageName', sql.NVarChar(50), OuterPackageName);
    request.input('QuantityPerOuter', sql.Int, QuantityPerOuter);
    request.input('Brand', sql.NVarChar(50), Brand || '');
    request.input('Size', sql.NVarChar(20), Size || '');
    request.input('TaxRate', sql.Decimal(18, 3), TaxRate);
    request.input('UnitPrice', sql.Decimal(18, 2), UnitPrice);
    request.input('RecommendedRetailPrice', sql.Decimal(18, 2), RecommendedRetailPrice || null);
    request.input('LeadTimeDays', sql.Int, LeadTimeDays);
    request.input('Barcode', sql.NVarChar(50), Barcode || '');
    request.input('IsChillerStock', sql.Bit, IsChillerStock || false);
    request.input('TypicalWeightPerUnit', sql.Decimal(18, 3), TypicalWeightPerUnit || 1.0);
    request.input('MarketingComments', sql.NVarChar(sql.MAX), MarketingComments || '');
    request.input('InternalComments', sql.NVarChar(sql.MAX), InternalComments || '');
    request.input('StockGroupNames', sql.NVarChar(sql.MAX), StockGroupNames || null);

    const result = await request.execute('sp_CreateProductoCompleto');

    if (result.returnValue === -1) {
      return res.status(400).json({ 
        error: 'Error al crear el producto',
        details: 'No se pudo crear el producto. Verifique los datos proporcionados.'
      });
    }

    res.status(201).json({
      message: 'Producto creado exitosamente',
      newStockItemID: result.recordset[0]?.NewStockItemID
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('Proveedor no encontrado')) {
      return res.status(400).json({ 
        error: 'Proveedor no encontrado',
        details: 'El proveedor especificado no existe en la base de datos'
      });
    }
    
    if (errorMessage.includes('Tipo de paquete')) {
      return res.status(400).json({ 
        error: 'Tipo de paquete no encontrado',
        details: errorMessage
      });
    }

    res.status(500).json({ 
      error: 'Error al crear el producto',
      details: errorMessage
    });
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      StockItemName,
      SupplierName,
      ColorName,
      UnitPackageName,
      OuterPackageName,
      QuantityPerOuter,
      Brand,
      Size,
      TaxRate,
      UnitPrice,
      RecommendedRetailPrice,
      LeadTimeDays,
      Barcode,
      IsChillerStock,
      TypicalWeightPerUnit,
      MarketingComments,
      InternalComments,
      StockGroupNames
    } = req.body;

    const pool = req.app.locals.db as sql.ConnectionPool;

    const request = pool.request();
    request.input('StockItemID', sql.Int, parseInt(id));
    request.input('StockItemName', sql.NVarChar(100), StockItemName || null);
    request.input('SupplierName', sql.NVarChar(100), SupplierName || null);
    request.input('ColorName', sql.NVarChar(20), ColorName || null);
    request.input('UnitPackageName', sql.NVarChar(50), UnitPackageName || null);
    request.input('OuterPackageName', sql.NVarChar(50), OuterPackageName || null);
    request.input('QuantityPerOuter', sql.Int, QuantityPerOuter || null);
    request.input('Brand', sql.NVarChar(50), Brand || null);
    request.input('Size', sql.NVarChar(20), Size || null);
    request.input('TaxRate', sql.Decimal(18, 3), TaxRate || null);
    request.input('UnitPrice', sql.Decimal(18, 2), UnitPrice || null);
    request.input('RecommendedRetailPrice', sql.Decimal(18, 2), RecommendedRetailPrice || null);
    request.input('LeadTimeDays', sql.Int, LeadTimeDays || null);
    request.input('Barcode', sql.NVarChar(50), Barcode || null);
    request.input('IsChillerStock', sql.Bit, IsChillerStock || null);
    request.input('TypicalWeightPerUnit', sql.Decimal(18, 3), TypicalWeightPerUnit || null);
    request.input('MarketingComments', sql.NVarChar(sql.MAX), MarketingComments || null);
    request.input('InternalComments', sql.NVarChar(sql.MAX), InternalComments || null);
    request.input('StockGroupNames', sql.NVarChar(sql.MAX), StockGroupNames || null);

    const result = await request.execute('sp_UpdateProductoCompleto');

    if (result.returnValue === -1) {
      return res.status(400).json({ 
        error: 'Error al actualizar el producto',
        details: 'No se pudo actualizar el producto. Verifique los datos proporcionados.'
      });
    }

    const filasAfectadas = result.recordset[0]?.FilasAfectadas || 0;

    if (filasAfectadas === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        details: 'El producto que intenta actualizar no existe'
      });
    }

    res.json({
      message: 'Producto actualizado exitosamente',
      filasAfectadas
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('Ya existe un producto con el nombre')) {
      return res.status(400).json({ 
        error: 'Nombre duplicado',
        details: 'Ya existe un producto con ese nombre. Use un nombre diferente.'
      });
    }
    
    if (errorMessage.includes('Producto no encontrado')) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        details: 'El producto que intenta actualizar no existe'
      });
    }
    
    if (errorMessage.includes('Proveedor no encontrado') || errorMessage.includes('Tipo de paquete')) {
      return res.status(400).json({ 
        error: 'Datos de referencia no encontrados',
        details: errorMessage
      });
    }

    res.status(500).json({ 
      error: 'Error al actualizar el producto',
      details: errorMessage
    });
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db as sql.ConnectionPool;

    const request = pool.request();
    request.input('StockItemID', sql.Int, parseInt(id));

    const result = await request.execute('sp_DeleteProducto');

    if (result.returnValue !== 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el producto',
        details: 'El producto tiene registros relacionados en órdenes de venta, facturas u órdenes de compra.'
      });
    }

    const eliminado = result.recordset[0]?.Eliminado;

    if (!eliminado) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        details: 'El producto que intenta eliminar no existe'
      });
    }

    res.json({
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('tiene registros relacionados')) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el producto',
        details: 'El producto tiene registros relacionados en órdenes de venta, facturas u órdenes de compra.'
      });
    }
    
    if (errorMessage.includes('no existe')) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        details: 'El producto que intenta eliminar no existe'
      });
    }

    res.status(500).json({ 
      error: 'Error al eliminar el producto',
      details: errorMessage
    });
  }
};