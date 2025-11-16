USE WWICorp
GO

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

CREATE PROCEDURE sp_GetFiltrosEstadisticas
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosEstadisticas
    ORDER BY tipo_filtro, etiqueta;
END
GO

-- Verificar que los procedimientos se crearon correctamente
SELECT name, type_desc, create_date 
FROM sys.procedures 
WHERE name LIKE 'sp_%'
ORDER BY name;
GO