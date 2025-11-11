USE WideWorldImporters;
GO

CREATE VIEW vw_FiltrosClientes AS
SELECT
    'categorias' as tipo_filtro,
    CustomerCategoryName as valor,
    CustomerCategoryName as etiqueta
FROM Sales.CustomerCategories
UNION ALL
SELECT
    'metodos_entrega' as tipo_filtro,
    DeliveryMethodName as valor,
    DeliveryMethodName as etiqueta
FROM Application.DeliveryMethods
WHERE DeliveryMethodName IS NOT NULL;
GO

CREATE VIEW vw_FiltrosProveedores AS
SELECT 
    'categorias' as tipo_filtro,
    SupplierCategoryName as valor,
    SupplierCategoryName as etiqueta
FROM Purchasing.SupplierCategories
UNION ALL
SELECT 
    'metodos_entrega' as tipo_filtro,
    DeliveryMethodName as valor,
    DeliveryMethodName as etiqueta
FROM Application.DeliveryMethods
WHERE DeliveryMethodName IS NOT NULL;
GO

CREATE VIEW vw_FiltrosInventarios AS
SELECT 
    'grupos' as tipo_filtro,
    StockGroupName as valor,
    StockGroupName as etiqueta
FROM Warehouse.StockGroups
WHERE StockGroupName IS NOT NULL
UNION ALL
SELECT 
    'marcas' as tipo_filtro,
    Brand as valor,
    Brand as etiqueta
FROM Warehouse.StockItems
WHERE Brand IS NOT NULL
GROUP BY Brand
UNION ALL
SELECT 
    'colores' as tipo_filtro,
    ColorName as valor,
    ColorName as etiqueta
FROM Warehouse.Colors
WHERE ColorName IS NOT NULL;
GO

CREATE VIEW vw_FiltrosVentas AS
SELECT 
    'metodos_entrega' as tipo_filtro,
    DeliveryMethodName as valor,
    DeliveryMethodName as etiqueta
FROM Application.DeliveryMethods
WHERE DeliveryMethodName IS NOT NULL
UNION ALL
SELECT 
    'anios' as tipo_filtro,
    CAST(YEAR(InvoiceDate) as NVARCHAR(4)) as valor,
    CAST(YEAR(InvoiceDate) as NVARCHAR(4)) as etiqueta
FROM Sales.Invoices
WHERE InvoiceDate IS NOT NULL
GROUP BY YEAR(InvoiceDate);
GO

CREATE VIEW vw_FiltrosEstadisticas AS
-- Años para estadísticas de productos
SELECT 
    'anios_productos' as tipo_filtro,
    CAST(YEAR(InvoiceDate) as NVARCHAR(4)) as valor,
    CAST(YEAR(InvoiceDate) as NVARCHAR(4)) as etiqueta
FROM Sales.Invoices
WHERE InvoiceDate IS NOT NULL
GROUP BY YEAR(InvoiceDate)
UNION ALL
-- Años para estadísticas de clientes y proveedores
SELECT 
    'anios_rango' as tipo_filtro,
    CAST(YEAR(InvoiceDate) as NVARCHAR(4)) as valor,
    CAST(YEAR(InvoiceDate) as NVARCHAR(4)) as etiqueta
FROM Sales.Invoices
WHERE InvoiceDate IS NOT NULL
GROUP BY YEAR(InvoiceDate)
UNION ALL
-- Categorías de clientes para estadísticas
SELECT 
    'categorias_clientes' as tipo_filtro,
    CustomerCategoryName as valor,
    CustomerCategoryName as etiqueta
FROM Sales.CustomerCategories
UNION ALL
-- Categorías de proveedores para estadísticas
SELECT 
    'categorias_proveedores' as tipo_filtro,
    SupplierCategoryName as valor,
    SupplierCategoryName as etiqueta
FROM Purchasing.SupplierCategories;
GO

CREATE PROCEDURE sp_GetFiltrosClientes
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosClientes
    ORDER BY tipo_filtro, etiqueta;
END
GO

CREATE PROCEDURE sp_GetFiltrosProveedores
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosProveedores
    ORDER BY tipo_filtro, etiqueta;
END
GO

CREATE PROCEDURE sp_GetFiltrosInventarios
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosInventarios
    ORDER BY tipo_filtro, etiqueta;
END
GO

CREATE PROCEDURE sp_GetFiltrosVentas
AS
BEGIN
    SELECT tipo_filtro, valor, etiqueta 
    FROM vw_FiltrosVentas
    ORDER BY tipo_filtro, etiqueta;
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

-- Vista para ciudades (útil para geolocalización)
CREATE VIEW vw_Ciudades AS
SELECT 
    CityID,
    CityName,
    StateProvinceID,
    LatestRecordedPopulation
FROM Application.Cities;
GO

-- Vista para métodos de entrega compartidos
CREATE VIEW vw_MetodosEntrega AS
SELECT 
    DeliveryMethodID,
    DeliveryMethodName
FROM Application.DeliveryMethods
WHERE DeliveryMethodName IS NOT NULL;
GO

-- Vista para rangos de años disponibles
CREATE VIEW vw_AniosDisponibles AS
SELECT 
    'ventas' as modulo,
    YEAR(InvoiceDate) as anio
FROM Sales.Invoices
WHERE InvoiceDate IS NOT NULL
GROUP BY YEAR(InvoiceDate)
UNION ALL
SELECT 
    'compras' as modulo,
    YEAR(OrderDate) as anio
FROM Purchasing.PurchaseOrders
WHERE OrderDate IS NOT NULL
GROUP BY YEAR(OrderDate);
GO


CREATE PROCEDURE sp_GetAniosDisponibles
    @Modulo NVARCHAR(50) = NULL
AS
BEGIN
    IF @Modulo IS NULL
        SELECT DISTINCT anio FROM vw_AniosDisponibles ORDER BY anio DESC;
    ELSE
        SELECT DISTINCT anio FROM vw_AniosDisponibles 
        WHERE modulo = @Modulo 
        ORDER BY anio DESC;
END
GO

CREATE PROCEDURE sp_GetCiudades
AS
BEGIN
    SELECT 
        CityID as id,
        CityName as nombre,
        LatestRecordedPopulation as poblacion
    FROM Application.Cities
    ORDER BY CityName;
END
GO

CREATE PROCEDURE sp_GetMetodosEntrega
AS
BEGIN
    SELECT 
        DeliveryMethodID as id,
        DeliveryMethodName as nombre
    FROM Application.DeliveryMethods
    WHERE DeliveryMethodName IS NOT NULL
    ORDER BY DeliveryMethodName;
END
GO