USE WideWorldImporters
GO
--exec getcustomerslist @pagenumber=1, @pagesize=50, @customer='%', @category='%' --tests

------------------------------- Summary queries for lists ------------------------------

CREATE OR ALTER PROCEDURE GetCustomersList
    @pageNumber INT, @pageSize INT, @customer NVARCHAR(100), @category NVARCHAR(50)
AS
SELECT CustomerID, CustomerName, CustomerCategory, DeliveryMethod
FROM CustomerData
WHERE CustomerName LIKE @customer AND CustomerCategory LIKE @category
ORDER BY
    CustomerName
-- @pageNumber starts at 1. Then, we have to subtract 1.
OFFSET (@pageNumber-1) * @PageSize ROWS
FETCH NEXT @pageSize ROWS ONLY
GO

CREATE OR ALTER PROCEDURE GetSuppliersList
    @pageNumber INT, @pageSize INT, @supplier NVARCHAR(100), @category NVARCHAR(50)
AS
SELECT SupplierID, SupplierName, SupplierCategory, DeliveryMethod
FROM SupplierData
WHERE SupplierName LIKE @supplier AND SupplierCategory LIKE @category
ORDER BY
    SupplierName
OFFSET (@pageNumber-1) * @PageSize ROWS
FETCH NEXT @pageSize ROWS ONLY
GO

CREATE OR ALTER PROCEDURE GetStockList
    @pageNumber INT, @pageSize INT, @product NVARCHAR(100), @group NVARCHAR(50)
AS
SELECT StockItemID, ProductName, StockGroup, QuantityOnHand
FROM StockData
WHERE ProductName LIKE @product AND StockGroup LIKE @group
ORDER BY
    ProductName
OFFSET (@pageNumber-1) * @PageSize ROWS
FETCH NEXT @pageSize ROWS ONLY
GO

CREATE OR ALTER PROCEDURE GetInvoicesList
    @pageNumber INT, @pageSize INT, @customer NVARCHAR(100)
AS
SELECT InvoiceID, InvoiceDate, CustomerName, DeliveryMethod, Total
FROM InvoiceSummaryData
WHERE CustomerName LIKE @customer
ORDER BY
    InvoiceID DESC
OFFSET (@pageNumber-1) * @PageSize ROWS
FETCH NEXT @pageSize ROWS ONLY
GO

------------------------------- Details queries ------------------------------

CREATE OR ALTER PROCEDURE GetCustomerDetails
    @customerID INT
AS
SELECT CustomerName, CustomerCategory, BuyingGroup, PrimaryContact, AlternateContact, BillToCustomer, DeliveryMethod, DeliveryCity, PostalCode, PhoneNumber, FaxNumber, PaymentDays, WebsiteURL, Address, DeliveryLocation
FROM CustomerData
WHERE CustomerID = @customerID
GO

CREATE OR ALTER PROCEDURE GetSupplierDetails
    @supplierID INT
AS
SELECT SupplierReference, SupplierName, SupplierCategory, PrimaryContact, AlternateContact, DeliveryMethod, DeliveryCity, PostalCode, PhoneNumber, FaxNumber, WebsiteURL, Address, DeliveryLocation, BankAccountName, BankAccountNumber, PaymentDays
FROM SupplierData
WHERE SupplierID = @supplierID
GO

CREATE OR ALTER PROCEDURE GetProductDetails
    @productID INT
AS
SELECT TOP 1 ProductName, SupplierName, Color, UnitPackageType, OuterPackageType, RecommendedRetailPrice, Weight, SearchDetails, QuantityPerOuter, Brand, Size, TaxRate, UnitPrice, QuantityOnHand, BinLocation
FROM StockData
WHERE StockItemID = @productID
GO

CREATE OR ALTER PROCEDURE sp_GetVentaDetalles
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

------------------------------- Total count queries ------------------------------

CREATE OR ALTER PROCEDURE GetTotalCustomers
AS
SELECT COUNT(*) AS Total
FROM CustomerData
GO

CREATE OR ALTER PROCEDURE GetTotalSuppliers
AS
SELECT COUNT(*) AS Total
FROM SupplierData
GO

CREATE OR ALTER PROCEDURE GetTotalStock
AS
SELECT COUNT(*) AS Total
FROM StockData
GO

CREATE OR ALTER PROCEDURE GetTotalInvoices
AS
SELECT COUNT(*) AS Total
FROM InvoiceData
GO

------------------------------- Statistics queries ------------------------------

CREATE OR ALTER PROCEDURE GetPurchaseOrderStat
    @pageNumber INT, 
    @pageSize INT,
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
    ),
    Estadisticas AS (
        SELECT 
            COALESCE(SupplierName, 'TOTAL') as proveedor,
            COALESCE(SupplierCategoryName, 'TOTAL CATEGORIA') as categoria,
            MIN(MontoCompra) as monto_minimo,
            MAX(MontoCompra) as monto_maximo,
            AVG(MontoCompra) as compra_promedio
        FROM Compras
        GROUP BY ROLLUP(SupplierName, SupplierCategoryName)
    )
    SELECT 
        categoria as CategoryName,
        proveedor as SupplierName,
        monto_minimo as Minimum,
        monto_maximo as Maximum,
        compra_promedio as Average
    FROM Estadisticas
    ORDER BY categoria, proveedor
    OFFSET (@pageNumber-1) * @PageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE GetInvoiceStat
    @pageNumber INT, 
    @pageSize INT,
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
    ),
    Estadisticas AS (
        SELECT 
            COALESCE(CustomerName, 'TOTAL') as cliente,
            COALESCE(CustomerCategoryName, 'TOTAL CATEGORIA') as categoria,
            MIN(MontoVenta) as monto_minimo,
            MAX(MontoVenta) as monto_maximo,
            AVG(MontoVenta) as venta_promedio
        FROM Ventas
        GROUP BY ROLLUP(CustomerName, CustomerCategoryName)
    )
    SELECT 
        categoria as CategoryName,
        cliente as CustomerName,
        monto_minimo as Minimum,
        monto_maximo as Maximum,
        venta_promedio as Average
    FROM Estadisticas
    ORDER BY categoria, cliente
    OFFSET (@pageNumber-1) * @PageSize ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE GetTop5ProductsStat
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
    SELECT TOP 5
        anio as Year,
        producto as ProductName,
        ganancia_total as Total
    FROM RankedProducts
    ORDER BY ganancia_total DESC;
END
GO

CREATE OR ALTER PROCEDURE GetTop5CustomersStat
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
    SELECT TOP 5
        anio as Year,
        cliente as CustomerName,
        monto_total as Total
    FROM RankedClients
    ORDER BY monto_total DESC;
END
GO

CREATE OR ALTER PROCEDURE GetTop5SuppliersStat
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
    SELECT TOP 5
        anio as Year,
        proveedor as SupplierName,
        monto_total as Total
    FROM RankedSuppliers
    ORDER BY monto_total DESC;
END
GO
------------------------------- Queries for catalogs ------------------------------

CREATE OR ALTER PROCEDURE GetCustomerCategories
AS
SELECT DISTINCT cc.CustomerCategoryID AS CategoryID, cc.CustomerCategoryName AS CategoryName
FROM Sales.CustomerCategories cc
INNER JOIN Sales.Customers c
ON
    cc.CustomerCategoryID = c.CustomerCategoryID
ORDER BY
    CustomerCategoryName
GO


CREATE OR ALTER PROCEDURE GetCustomerDeliveryMethods
AS
SELECT DISTINCT dm.DeliveryMethodID, dm.DeliveryMethodName
FROM Application.DeliveryMethods dm
INNER JOIN Sales.Customers c
ON
    dm.DeliveryMethodID = c.DeliveryMethodID
GO

CREATE OR ALTER PROCEDURE sp_GetFiltrosClientes
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosClientes
    ORDER BY tipo_filtro, etiqueta;
END
GO

CREATE OR ALTER PROCEDURE sp_GetFiltrosProveedores
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosProveedores
    ORDER BY tipo_filtro, etiqueta;
END
GO

CREATE OR ALTER PROCEDURE sp_GetFiltrosInventarios
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosInventarios
    ORDER BY tipo_filtro, etiqueta;
END
GO

CREATE OR ALTER PROCEDURE sp_GetFiltrosVentas
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosVentas
    ORDER BY tipo_filtro, etiqueta;
END
GO

CREATE OR ALTER PROCEDURE sp_GetFiltrosEstadisticas
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosEstadisticas
    ORDER BY tipo_filtro, etiqueta;
END
GO
