USE WWICorp
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

