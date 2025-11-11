USE WideWorldImporters;
GO

-- Eliminar procedimientos existentes si existen
IF OBJECT_ID('sp_GetClientes', 'P') IS NOT NULL DROP PROCEDURE sp_GetClientes;
IF OBJECT_ID('sp_GetClienteDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetClienteDetalles;
IF OBJECT_ID('sp_GetProveedores', 'P') IS NOT NULL DROP PROCEDURE sp_GetProveedores;
IF OBJECT_ID('sp_GetProveedorDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetProveedorDetalles;
IF OBJECT_ID('sp_GetInventarios', 'P') IS NOT NULL DROP PROCEDURE sp_GetInventarios;
IF OBJECT_ID('sp_GetProductoDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetProductoDetalles;
IF OBJECT_ID('sp_GetVentas', 'P') IS NOT NULL DROP PROCEDURE sp_GetVentas;
IF OBJECT_ID('sp_GetVentaDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetVentaDetalles;
IF OBJECT_ID('sp_EstadisticasComprasProveedores', 'P') IS NOT NULL DROP PROCEDURE sp_EstadisticasComprasProveedores;
IF OBJECT_ID('sp_EstadisticasVentasClientes', 'P') IS NOT NULL DROP PROCEDURE sp_EstadisticasVentasClientes;
IF OBJECT_ID('sp_Top5ProductosGanancia', 'P') IS NOT NULL DROP PROCEDURE sp_Top5ProductosGanancia;
IF OBJECT_ID('sp_Top5ClientesFacturas', 'P') IS NOT NULL DROP PROCEDURE sp_Top5ClientesFacturas;
IF OBJECT_ID('sp_Top5ProveedoresOrdenes', 'P') IS NOT NULL DROP PROCEDURE sp_Top5ProveedoresOrdenes;

-- Procedimientos de conteo para paginación
IF OBJECT_ID('sp_GetTotalClientes', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalClientes;
IF OBJECT_ID('sp_GetTotalProveedores', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalProveedores;
IF OBJECT_ID('sp_GetTotalInventarios', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalInventarios;
IF OBJECT_ID('sp_GetTotalVentas', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalVentas;
GO

-- =============================================
-- PROCEDIMIENTOS CON PAGINACIÓN
-- =============================================

CREATE PROCEDURE sp_GetClientes
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT 
        c.CustomerID as id,
        c.CustomerName as nombre,
        cat.CustomerCategoryName as categoria,
        dm.DeliveryMethodName as metodo_entrega
    FROM Sales.Customers c
    INNER JOIN Sales.CustomerCategories cat ON c.CustomerCategoryID = cat.CustomerCategoryID
    INNER JOIN Application.DeliveryMethods dm ON c.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR c.CustomerName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR cat.CustomerCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%')
    ORDER BY c.CustomerName ASC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalClientes
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT COUNT(*) as Total
    FROM Sales.Customers c
    INNER JOIN Sales.CustomerCategories cat ON c.CustomerCategoryID = cat.CustomerCategoryID
    INNER JOIN Application.DeliveryMethods dm ON c.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR c.CustomerName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR cat.CustomerCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%');
END
GO

CREATE PROCEDURE sp_GetClienteDetalles
    @CustomerID INT
AS
BEGIN
    SELECT 
        c.CustomerID,
        c.CustomerName as nombre_cliente,
        cc.CustomerCategoryName as categoria,
        bg.BuyingGroupName as grupo_compra,
        p.FullName as contacto_primario,
        p2.FullName as contacto_alternativo,
        c.BillToCustomerID as cliente_facturar,
        dm.DeliveryMethodName as metodo_entrega,
        city.CityName as ciudad_entrega,
        c.DeliveryPostalCode as codigo_postal,
        c.PhoneNumber as telefono,
        c.FaxNumber as fax,
        c.PaymentDays as dias_gracia_pago,
        c.WebsiteURL as sitio_web,
        c.DeliveryAddressLine1 as direccion_entrega,
        c.DeliveryAddressLine2 as direccion_entrega2,
        c.DeliveryPostalCode as codigo_postal_entrega,
        c.DeliveryLocation.Lat as latitud, 
        c.DeliveryLocation.Long as longitud  
    FROM Sales.Customers c
    INNER JOIN Sales.CustomerCategories cc ON c.CustomerCategoryID = cc.CustomerCategoryID
    INNER JOIN Application.DeliveryMethods dm ON c.DeliveryMethodID = dm.DeliveryMethodID
    INNER JOIN Application.Cities city ON c.DeliveryCityID = city.CityID
    LEFT JOIN Application.People p ON c.PrimaryContactPersonID = p.PersonID
    LEFT JOIN Application.People p2 ON c.AlternateContactPersonID = p2.PersonID
    LEFT JOIN Sales.BuyingGroups bg ON c.BuyingGroupID = bg.BuyingGroupID
    WHERE c.CustomerID = @CustomerID;
END
GO

CREATE PROCEDURE sp_GetProveedores
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT 
        s.SupplierID as id,
        s.SupplierName as nombre,
        sc.SupplierCategoryName as categoria,
        dm.DeliveryMethodName as metodo_entrega
    FROM Purchasing.Suppliers s
    INNER JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
    INNER JOIN Application.DeliveryMethods dm ON s.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR s.SupplierName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR sc.SupplierCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%')
    ORDER BY s.SupplierName ASC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalProveedores
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT COUNT(*) as Total
    FROM Purchasing.Suppliers s
    INNER JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
    INNER JOIN Application.DeliveryMethods dm ON s.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR s.SupplierName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR sc.SupplierCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%');
END
GO

CREATE PROCEDURE sp_GetProveedorDetalles
    @SupplierID INT
AS
BEGIN
    SELECT 
        s.SupplierID,
        s.SupplierReference as codigo_proveedor,
        s.SupplierName as nombre_proveedor,
        sc.SupplierCategoryName as categoria,
        p.FullName as contacto_primario,
        p2.FullName as contacto_alternativo,
        dm.DeliveryMethodName as metodo_entrega,
        city.CityName as ciudad_entrega,
        s.DeliveryPostalCode as codigo_postal_entrega,
        s.PhoneNumber as telefono,
        s.FaxNumber as fax,
        s.WebsiteURL as sitio_web,
        s.DeliveryAddressLine1 as direccion_entrega,
        s.DeliveryAddressLine2 as direccion_entrega2,
        s.BankAccountName as nombre_banco,
        s.BankAccountCode as numero_cuenta,
        s.PaymentDays as dias_gracia_pago,
        s.DeliveryLocation.Lat as latitud,
        s.DeliveryLocation.Long as longitud
    FROM Purchasing.Suppliers s
    INNER JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
    INNER JOIN Application.DeliveryMethods dm ON s.DeliveryMethodID = dm.DeliveryMethodID
    INNER JOIN Application.People p ON s.PrimaryContactPersonID = p.PersonID
    LEFT JOIN Application.People p2 ON s.AlternateContactPersonID = p2.PersonID
    INNER JOIN Application.Cities city ON s.DeliveryCityID = city.CityID
    WHERE s.SupplierID = @SupplierID;
END
GO

CREATE PROCEDURE sp_GetInventarios
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroGrupo NVARCHAR(100) = NULL,
    @CantidadMin INT = NULL
AS
BEGIN
    WITH ProductosConGrupos AS (
        SELECT DISTINCT
            si.StockItemID,
            si.StockItemName,
            si.Brand,
            sih.QuantityOnHand,
            STUFF((
                SELECT ', ' + sg.StockGroupName
                FROM Warehouse.StockItemStockGroups sig
                INNER JOIN Warehouse.StockGroups sg ON sig.StockGroupID = sg.StockGroupID
                WHERE sig.StockItemID = si.StockItemID
                FOR XML PATH('')), 1, 2, '') as Grupos
        FROM Warehouse.StockItems si
        INNER JOIN Warehouse.StockItemHoldings sih ON si.StockItemID = sih.StockItemID
    )
    SELECT 
        StockItemID as id,
        StockItemName as nombre_producto,
        Brand as marca,
        Grupos as grupo,
        QuantityOnHand as cantidad_inventario
    FROM ProductosConGrupos
    WHERE (@FiltroNombre IS NULL OR StockItemName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroGrupo IS NULL OR Grupos LIKE '%' + @FiltroGrupo + '%')
    AND (@CantidadMin IS NULL OR QuantityOnHand >= @CantidadMin)
    ORDER BY StockItemName
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalInventarios
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroGrupo NVARCHAR(100) = NULL,
    @CantidadMin INT = NULL
AS
BEGIN
    WITH ProductosConGrupos AS (
        SELECT DISTINCT
            si.StockItemID,
            si.StockItemName,
            sih.QuantityOnHand,
            STUFF((
                SELECT ', ' + sg.StockGroupName
                FROM Warehouse.StockItemStockGroups sig
                INNER JOIN Warehouse.StockGroups sg ON sig.StockGroupID = sg.StockGroupID
                WHERE sig.StockItemID = si.StockItemID
                FOR XML PATH('')), 1, 2, '') as Grupos
        FROM Warehouse.StockItems si
        INNER JOIN Warehouse.StockItemHoldings sih ON si.StockItemID = sih.StockItemID
    )
    SELECT COUNT(*) as Total
    FROM ProductosConGrupos
    WHERE (@FiltroNombre IS NULL OR StockItemName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroGrupo IS NULL OR Grupos LIKE '%' + @FiltroGrupo + '%')
    AND (@CantidadMin IS NULL OR QuantityOnHand >= @CantidadMin);
END
GO

CREATE PROCEDURE sp_GetProductoDetalles
    @StockItemID INT
AS
BEGIN
    SELECT 
        si.StockItemID,
        si.StockItemName as nombre_producto,
        s.SupplierName as nombre_proveedor,
        s.SupplierID as proveedor_id,
        c.ColorName as color,
        pt.PackageTypeName as unidad_empaquetamiento,
        pt2.PackageTypeName as empaquetamiento_externo,
        si.QuantityPerOuter as cantidad_empaquetamiento,
        si.Brand as marca,
        si.Size as tamano,
        si.TaxRate as impuesto,
        si.UnitPrice as precio_unitario,
        si.RecommendedRetailPrice as precio_venta,
        si.LeadTimeDays as paso,
        si.SearchDetails as palabras_claves,
        sih.QuantityOnHand as cantidad_disponible,
        si.Barcode as ubicacion
    FROM Warehouse.StockItems si
    LEFT JOIN Purchasing.Suppliers s ON si.SupplierID = s.SupplierID
    LEFT JOIN Warehouse.PackageTypes pt ON si.UnitPackageID = pt.PackageTypeID
    LEFT JOIN Warehouse.PackageTypes pt2 ON si.OuterPackageID = pt2.PackageTypeID
    LEFT JOIN Warehouse.StockItemHoldings sih ON si.StockItemID = sih.StockItemID
    LEFT JOIN Warehouse.Colors c ON si.ColorID = c.ColorID
    WHERE si.StockItemID = @StockItemID;
END
GO

CREATE PROCEDURE sp_GetVentas
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroCliente NVARCHAR(100) = NULL,
    @FechaInicio DATE = NULL,
    @FechaFin DATE = NULL,
    @MetodoEntrega NVARCHAR(100) = NULL,
    @MontoMin DECIMAL(18,2) = NULL,
    @MontoMax DECIMAL(18,2) = NULL
AS
BEGIN
    WITH FacturasFiltradas AS (
        SELECT 
            i.InvoiceID,
            i.InvoiceDate,
            c.CustomerName,
            dm.DeliveryMethodName
        FROM Sales.Invoices i
        INNER JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
        INNER JOIN Application.DeliveryMethods dm ON i.DeliveryMethodID = dm.DeliveryMethodID
        WHERE (@FiltroCliente IS NULL OR c.CustomerName LIKE '%' + @FiltroCliente + '%')
        AND (@FechaInicio IS NULL OR i.InvoiceDate >= @FechaInicio)
        AND (@FechaFin IS NULL OR i.InvoiceDate <= @FechaFin)
        AND (@MetodoEntrega IS NULL OR dm.DeliveryMethodName = @MetodoEntrega)
    ),
    VentasConMonto AS (
        SELECT 
            ff.InvoiceID,
            ff.InvoiceDate,
            ff.CustomerName,
            ff.DeliveryMethodName,
            (SELECT SUM(il.Quantity * il.UnitPrice) 
             FROM Sales.InvoiceLines il 
             WHERE il.InvoiceID = ff.InvoiceID) as MontoTotal
        FROM FacturasFiltradas ff
    )
    SELECT 
        InvoiceID as id,
        InvoiceDate as fecha,
        CustomerName as cliente,
        DeliveryMethodName as metodo_entrega,
        MontoTotal as monto
    FROM VentasConMonto
    WHERE (@MontoMin IS NULL OR MontoTotal >= @MontoMin)
    AND (@MontoMax IS NULL OR MontoTotal <= @MontoMax)
    ORDER BY InvoiceDate DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalVentas
    @FiltroCliente NVARCHAR(100) = NULL,
    @FechaInicio DATE = NULL,
    @FechaFin DATE = NULL,
    @MetodoEntrega NVARCHAR(100) = NULL,
    @MontoMin DECIMAL(18,2) = NULL,
    @MontoMax DECIMAL(18,2) = NULL
AS
BEGIN
    WITH FacturasFiltradas AS (
        SELECT 
            i.InvoiceID
        FROM Sales.Invoices i
        INNER JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
        INNER JOIN Application.DeliveryMethods dm ON i.DeliveryMethodID = dm.DeliveryMethodID
        WHERE (@FiltroCliente IS NULL OR c.CustomerName LIKE '%' + @FiltroCliente + '%')
        AND (@FechaInicio IS NULL OR i.InvoiceDate >= @FechaInicio)
        AND (@FechaFin IS NULL OR i.InvoiceDate <= @FechaFin)
        AND (@MetodoEntrega IS NULL OR dm.DeliveryMethodName = @MetodoEntrega)
    ),
    VentasConMonto AS (
        SELECT 
            ff.InvoiceID,
            (SELECT SUM(il.Quantity * il.UnitPrice) 
             FROM Sales.InvoiceLines il 
             WHERE il.InvoiceID = ff.InvoiceID) as MontoTotal
        FROM FacturasFiltradas ff
    )
    SELECT COUNT(*) as Total
    FROM VentasConMonto
    WHERE (@MontoMin IS NULL OR MontoTotal >= @MontoMin)
    AND (@MontoMax IS NULL OR MontoTotal <= @MontoMax);
END
GO

CREATE PROCEDURE sp_GetVentaDetalles
    @InvoiceID INT
AS
BEGIN
    -- Encabezado
    SELECT 
        i.InvoiceID as numero_factura,
        c.CustomerName as nombre_cliente,
        dm.DeliveryMethodName as metodo_entrega,
        i.CustomerPurchaseOrderNumber as numero_orden,
        p.FullName as persona_contacto,
        sp.FullName as nombre_vendedor,
        i.InvoiceDate as fecha_factura,
        i.DeliveryInstructions as instrucciones_entrega
    FROM Sales.Invoices i
    INNER JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
    INNER JOIN Application.DeliveryMethods dm ON i.DeliveryMethodID = dm.DeliveryMethodID
    INNER JOIN Application.People p ON i.ContactPersonID = p.PersonID
    INNER JOIN Application.People sp ON i.SalespersonPersonID = sp.PersonID
    WHERE i.InvoiceID = @InvoiceID;

    -- Detalle
    SELECT 
        si.StockItemName as nombre_producto,
        il.Quantity as cantidad,
        il.UnitPrice as precio_unitario,
        il.TaxRate as impuesto_aplicado,
        il.TaxAmount as monto_impuesto,
        il.LineProfit as ganancia_linea,
        (il.Quantity * il.UnitPrice) as total_linea
    FROM Sales.InvoiceLines il
    INNER JOIN Warehouse.StockItems si ON il.StockItemID = si.StockItemID
    WHERE il.InvoiceID = @InvoiceID;
END
GO

-- =============================================
-- MÓDULO ESTADÍSTICAS CON PAGINACIÓN
-- =============================================

CREATE PROCEDURE sp_EstadisticasComprasProveedores
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @Filtro NVARCHAR(100) = NULL
AS
BEGIN
    WITH Compras AS (
        SELECT 
            s.SupplierName,
            sc.SupplierCategoryName,
            pl.ExpectedUnitPricePerOuter * pl.OrderedOuters as MontoCompra
        FROM Purchasing.PurchaseOrders po
        INNER JOIN Purchasing.PurchaseOrderLines pl ON po.PurchaseOrderID = pl.PurchaseOrderID
        INNER JOIN Purchasing.Suppliers s ON po.SupplierID = s.SupplierID
        INNER JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
        WHERE (@Filtro IS NULL OR s.SupplierName LIKE '%' + @Filtro + '%' OR sc.SupplierCategoryName LIKE '%' + @Filtro + '%')
    )
    SELECT 
        COALESCE(SupplierName, 'TOTAL') as proveedor,
        COALESCE(SupplierCategoryName, 'TOTAL CATEGORIA') as categoria,
        MIN(MontoCompra) as monto_minimo,
        MAX(MontoCompra) as monto_maximo,
        AVG(MontoCompra) as compra_promedio
    FROM Compras
    GROUP BY ROLLUP(SupplierName, SupplierCategoryName)
    ORDER BY SupplierName, SupplierCategoryName
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_EstadisticasVentasClientes
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @Filtro NVARCHAR(100) = NULL
AS
BEGIN
    WITH Ventas AS (
        SELECT 
            c.CustomerName,
            cc.CustomerCategoryName,
            (SELECT SUM(il.Quantity * il.UnitPrice) FROM Sales.InvoiceLines il WHERE il.InvoiceID = i.InvoiceID) as MontoVenta
        FROM Sales.Invoices i
        INNER JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
        INNER JOIN Sales.CustomerCategories cc ON c.CustomerCategoryID = cc.CustomerCategoryID
        WHERE (@Filtro IS NULL OR c.CustomerName LIKE '%' + @Filtro + '%' OR cc.CustomerCategoryName LIKE '%' + @Filtro + '%')
    )
    SELECT 
        COALESCE(CustomerName, 'TOTAL') as cliente,
        COALESCE(CustomerCategoryName, 'TOTAL CATEGORIA') as categoria,
        MIN(MontoVenta) as monto_minimo,
        MAX(MontoVenta) as monto_maximo,
        AVG(MontoVenta) as venta_promedio
    FROM Ventas
    GROUP BY ROLLUP(CustomerName, CustomerCategoryName)
    ORDER BY CustomerName, CustomerCategoryName
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_Top5ProductosGanancia
    @Anio INT
AS
BEGIN
    WITH RankedProducts AS (
        SELECT 
            si.StockItemName as producto,
            YEAR(i.InvoiceDate) as anio,
            SUM(il.LineProfit) as ganancia_total,
            DENSE_RANK() OVER (PARTITION BY YEAR(i.InvoiceDate) ORDER BY SUM(il.LineProfit) DESC) as ranking
        FROM Sales.InvoiceLines il
        INNER JOIN Sales.Invoices i ON il.InvoiceID = i.InvoiceID
        INNER JOIN Warehouse.StockItems si ON il.StockItemID = si.StockItemID
        WHERE YEAR(i.InvoiceDate) = @Anio
        GROUP BY si.StockItemName, YEAR(i.InvoiceDate)
    )
    SELECT TOP 5 producto, anio, ganancia_total
    FROM RankedProducts
    ORDER BY ganancia_total DESC;
END
GO

CREATE PROCEDURE sp_Top5ClientesFacturas
    @AnioInicio INT,
    @AnioFin INT
AS
BEGIN
    WITH RankedClients AS (
        SELECT 
            c.CustomerName as cliente,
            YEAR(i.InvoiceDate) as anio,
            COUNT(i.InvoiceID) as cantidad_facturas,
            SUM(il.ExtendedPrice) as monto_total,
            DENSE_RANK() OVER (PARTITION BY YEAR(i.InvoiceDate) ORDER BY COUNT(i.InvoiceID) DESC) as ranking
        FROM Sales.Invoices i
        INNER JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
        INNER JOIN Sales.InvoiceLines il ON i.InvoiceID = il.InvoiceID
        WHERE YEAR(i.InvoiceDate) BETWEEN @AnioInicio AND @AnioFin
        GROUP BY c.CustomerName, YEAR(i.InvoiceDate)
    )
    SELECT TOP 5 cliente, anio, cantidad_facturas, monto_total
    FROM RankedClients
    ORDER BY monto_total DESC;
END
GO

CREATE PROCEDURE sp_Top5ProveedoresOrdenes
    @AnioInicio INT,
    @AnioFin INT
AS
BEGIN
    WITH RankedSuppliers AS (
        SELECT 
            s.SupplierName as proveedor,
            YEAR(po.OrderDate) as anio,
            COUNT(po.PurchaseOrderID) as cantidad_ordenes,
            SUM(pl.ExpectedUnitPricePerOuter * pl.OrderedOuters) as monto_total,
            DENSE_RANK() OVER (PARTITION BY YEAR(po.OrderDate) ORDER BY COUNT(po.PurchaseOrderID) DESC) as ranking
        FROM Purchasing.PurchaseOrders po
        INNER JOIN Purchasing.PurchaseOrderLines pl ON po.PurchaseOrderID = pl.PurchaseOrderID
        INNER JOIN Purchasing.Suppliers s ON po.SupplierID = s.SupplierID
        WHERE YEAR(po.OrderDate) BETWEEN @AnioInicio AND @AnioFin
        GROUP BY s.SupplierName, YEAR(po.OrderDate)
    )
    SELECT TOP 5 proveedor, anio, cantidad_ordenes, monto_total
    FROM RankedSuppliers
    ORDER BY monto_total DESC;
END
GO

-- Verificar que los procedimientos se crearon correctamente
SELECT name, type_desc, create_date 
FROM sys.procedures 
WHERE name LIKE 'sp_%'
ORDER BY name;
GO