--USE WWISJ
--USE WWILM
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
