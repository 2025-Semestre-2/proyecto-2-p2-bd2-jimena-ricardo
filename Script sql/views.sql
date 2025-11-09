USE WideWorldImporters
GO
-- To enable window clauses.
ALTER DATABASE WideWorldImporters
SET COMPATIBILITY_LEVEL = 160;

GO

CREATE OR ALTER VIEW CustomerData
AS
SELECT c.CustomerID, c.CustomerName, cc.CustomerCategoryName AS CustomerCategory, bg.BuyingGroupName AS BuyingGroup, pc.FullName AS PrimaryContact, ac.FullName AS AlternateContact, bc.CustomerName AS BillToCustomer, dm.DeliveryMethodName AS DeliveryMethod, dc.CityName AS DeliveryCity, c.PostalCityID AS PostalCode, c.PhoneNumber, c.FaxNumber, c.PaymentDays, c.WebsiteURL, CONCAT(
        'Dirección de entrega: ', c.DeliveryAddressLine1, ', ', c.DeliveryAddressLine2, '. Dirección postal: ', c.PostalAddressLine1, ', ', c.PostalAddressLine2
        ) AS Address, c.DeliveryLocation
FROM sales.Customers c
LEFT JOIN sales.CustomerCategories cc
ON
    c.CustomerCategoryID = cc.CustomerCategoryID
LEFT JOIN sales.BuyingGroups bg
ON
    c.BuyingGroupID = bg.BuyingGroupID
LEFT JOIN Application.People pc
-- For the primary contact.
ON
    c.PrimaryContactPersonID = pc.PersonID
LEFT JOIN Application.People ac
-- For the alternate contact.
ON
    c.AlternateContactPersonID = ac.PersonID
LEFT JOIN sales.Customers bc
-- For the customer to be billed.
ON
    c.BillToCustomerID = bc.CustomerID
LEFT JOIN Application.DeliveryMethods dm
ON
    c.DeliveryMethodID = dm.DeliveryMethodID
LEFT JOIN Application.Cities dc
ON
    c.DeliveryCityID = dc.CityID
-- Note: Here I don't join again Cities to obtain the postal city
-- name because the project specification just asks for the postal
-- code, which is already in the Customers table.
GO


CREATE OR ALTER VIEW SupplierData
AS
SELECT s.SupplierID, s.SupplierReference, s.SupplierName, sc.SupplierCategoryName AS SupplierCategory, pc.FullName AS PrimaryContact, ac.FullName AS AlternateContact, dm.DeliveryMethodName AS DeliveryMethod, dc.CityName AS DeliveryCity, s.PostalCityID AS PostalCode, s.PhoneNumber, s.FaxNumber, s.WebsiteURL, CONCAT(
        'Dirección de entrega: ', s.DeliveryAddressLine1, ', ', s.DeliveryAddressLine2, '. Dirección postal: ', s.PostalAddressLine1, ', ', s.PostalAddressLine2
        ) AS Address, s.DeliveryLocation, s.BankAccountName, s.BankAccountNumber, s.PaymentDays
FROM Purchasing.Suppliers s
LEFT JOIN Purchasing.SupplierCategories sc
ON
    s.SupplierCategoryID = sc.SupplierCategoryID
LEFT JOIN Application.People pc
-- For the primary contact.
ON
    s.PrimaryContactPersonID = pc.PersonID
LEFT JOIN Application.People ac
-- For the alternate contact.
ON
    s.AlternateContactPersonID = ac.PersonID
LEFT JOIN Application.DeliveryMethods dm
ON
    s.DeliveryMethodID = dm.DeliveryMethodID
LEFT JOIN Application.Cities dc
ON
    s.DeliveryCityID = dc.CityID
-- Note: Here I don't join again Cities to obtain the postal city
-- name because the project specification just asks for the postal
-- code, which is already in the Customers table.
GO


CREATE OR ALTER VIEW StockData
AS
SELECT si.StockItemID, si.StockItemName AS ProductName, s.SupplierName, c.ColorName AS Color, up.PackageTypeName AS UnitPackageType, op.PackageTypeName AS OuterPackageType, si.RecommendedRetailPrice, si.TypicalWeightPerUnit AS Weight, si.SearchDetails, si.QuantityPerOuter, si.Brand, si.Size, si.TaxRate, si.UnitPrice, h.QuantityOnHand, h.BinLocation, g.StockGroupName AS StockGroup
FROM Warehouse.StockItems si
LEFT JOIN Purchasing.Suppliers s
ON
    si.SupplierID = s.SupplierID
LEFT JOIN Warehouse.Colors c
ON
    si.ColorID = c.ColorID
LEFT JOIN Warehouse.PackageTypes up
ON
    si.UnitPackageID = up.PackageTypeID
LEFT JOIN Warehouse.PackageTypes op
ON
    si.OuterPackageID = op.PackageTypeID
LEFT JOIN Warehouse.StockItemHoldings h
ON
    si.StockItemID = h.StockItemID
LEFT JOIN Warehouse.StockItemStockGroups ss
ON
    si.StockItemID = ss.StockItemID
LEFT JOIN Warehouse.StockGroups g
ON
    ss.StockGroupID = g.StockGroupID
GO


CREATE OR ALTER VIEW InvoiceSummaryData
AS
SELECT i.InvoiceID, i.InvoiceDate, c.CustomerName, dm.DeliveryMethodName AS DeliveryMethod, SUM(il.Quantity * il.UnitPrice) AS Total
FROM Sales.Invoices i
LEFT JOIN Sales.Customers c
ON
    i.CustomerID = c.CustomerID
LEFT JOIN Application.DeliveryMethods dm
ON
    i.DeliveryMethodID = dm.DeliveryMethodID
LEFT JOIN Sales.InvoiceLines il
ON
    i.InvoiceID = il.InvoiceID
GROUP BY
    i.InvoiceID, i.invoiceDate, c.CustomerName, dm.DeliveryMethodName
GO

CREATE OR ALTER VIEW InvoiceHeaderData
AS
SELECT i.InvoiceID, c.CustomerName, dm.DeliveryMethodName AS DeliveryMethod, i.CustomerPurchaseOrderNumber AS OrderNumber, cp.FullName AS ContactPerson, sp.FullName AS SalesPerson, i.InvoiceDate, i.DeliveryInstructions
FROM Sales.Invoices i
LEFT JOIN Sales.Customers c
ON
    i.CustomerID = c.CustomerID
LEFT JOIN Application.DeliveryMethods dm
ON
    i.DeliveryMethodID = dm.DeliveryMethodID
LEFT JOIN Application.People cp
ON
    i.ContactPersonID = cp.PersonID
LEFT JOIN Application.People sp
ON
    i.SalespersonPersonID = sp.PersonID
GO


CREATE OR ALTER VIEW InvoiceLinesData
AS
SELECT i.InvoiceID, si.StockItemName AS ProductName, il.Quantity, il.UnitPrice, il.TaxRate, il.TaxAmount, il.Quantity * il.UnitPrice AS Total
FROM Sales.Invoices i
LEFT JOIN Sales.Customers c
ON
    i.CustomerID = c.CustomerID
LEFT JOIN Application.DeliveryMethods dm
ON
    i.DeliveryMethodID = dm.DeliveryMethodID
LEFT JOIN Application.People cp
ON
    i.ContactPersonID = cp.PersonID
LEFT JOIN Application.People sp
ON
    i.SalespersonPersonID = sp.PersonID
LEFT JOIN Sales.InvoiceLines il
ON
    i.InvoiceID = il.InvoiceID
LEFT JOIN Warehouse.StockItems si
ON
    il.StockItemID = si.StockItemID
UNION ALL
    
SELECT i.InvoiceID, 'Total' AS ProductName, NULL AS Quantity, NULL AS UnitPrice, NULL AS TaxRate, NULL AS TaxAmount, SUM(il.Quantity * il.UnitPrice) AS Total
FROM Sales.Invoices i
LEFT JOIN Sales.InvoiceLines il
ON
    i.InvoiceID = il.InvoiceID
GROUP BY i.InvoiceID
GO


CREATE OR ALTER VIEW PurchaseOrderStat
AS
SELECT sc.SupplierCategoryName AS CategoryName, COALESCE(s.SupplierName, 'Total') AS SupplierName, MIN(l.ReceivedOuters * l.ExpectedUnitPricePerOuter) AS Minimum, MAX(l.ReceivedOuters * l.ExpectedUnitPricePerOuter) AS Maximum, ROUND(AVG(l.ReceivedOuters * l.ExpectedUnitPricePerOuter), 2) AS Average
FROM Purchasing.PurchaseOrders p
LEFT JOIN Purchasing.Suppliers s 
ON
    p.SupplierID = s.SupplierID
LEFT JOIN Purchasing.SupplierCategories sc
ON
    s.SupplierCategoryID = sc.SupplierCategoryID
LEFT JOIN Purchasing.PurchaseOrderLines l
ON
    p.PurchaseOrderID = l.PurchaseOrderID
GROUP BY ROLLUP(sc.SupplierCategoryName, s.SupplierName)
GO
 

CREATE OR ALTER VIEW InvoiceStat
AS
SELECT cc.CustomerCategoryName AS CategoryName, c.CustomerName, MIN(l.Quantity * l.UnitPrice) AS Minimum, MAX(l.Quantity * l.UnitPrice) AS Maximum, ROUND(AVG(l.Quantity * l.UnitPrice), 2) AS Average
FROM Sales.Invoices i
LEFT JOIN Sales.Customers c
ON
    i.CustomerID = c.CustomerID
LEFT JOIN Sales.CustomerCategories cc
ON
    c.CustomerCategoryID = cc.CustomerCategoryID
LEFT JOIN Sales.InvoiceLines l
ON
    i.InvoiceID = l.InvoiceID
GROUP BY
    ROLLUP(cc.CustomerCategoryName, c.CustomerName)
GO
-- Note: I couln't add a WHERE clause to filter the Position column because
-- the name Position wasn't valid at that point and also was invalid to use
-- 'DENSE_RANK() OVER w' directly because is invalid to use windows outside
-- SELECT statements. That's why I extracted the query to a WITH statement
-- and later filtered using the Position column.
CREATE OR ALTER VIEW Top5ProductsStat
AS
WITH RankedData
AS (
SELECT YEAR(i.InvoiceDate) AS Year, StockItemName AS ProductName, SUM(il.Quantity * il.UnitPrice) AS Total, DENSE_RANK() OVER w AS Pos
FROM Warehouse.StockItems si
JOIN Sales.InvoiceLines il
ON
    si.StockItemID = il.StockItemID
JOIN Sales.Invoices i
ON
    il.InvoiceID = i.InvoiceID
GROUP BY
    YEAR(i.InvoiceDate), StockItemName
WINDOW w AS (
PARTITION BY YEAR(i.InvoiceDate)
ORDER BY
    SUM(il.Quantity * il.UnitPrice)
)
)
SELECT *
FROM RankedData
WHERE Pos <= 5
GO
-- A WITH statement was used here for the same reason as in Top5ProductsStat.
CREATE OR ALTER VIEW Top5CustomersStat
AS
WITH RankedData
AS (
SELECT YEAR(i.InvoiceDate) AS Year, c.CustomerName, SUM(il.Quantity * il.UnitPrice) AS Total, DENSE_RANK() OVER w AS Pos
FROM Warehouse.StockItems si
JOIN Sales.InvoiceLines il
ON
    si.StockItemID = il.StockItemID
JOIN Sales.Invoices i
ON
    il.InvoiceID = i.InvoiceID
JOIN Sales.Customers c
ON
    i.CustomerID = c.CustomerID
GROUP BY
    YEAR(i.InvoiceDate), c.CustomerName
WINDOW w AS (
PARTITION BY YEAR(i.InvoiceDate)
ORDER BY
    SUM(il.Quantity * il.UnitPrice)
)
)
SELECT *
FROM RankedData
WHERE Pos <= 5
GO
-- A WITH statement was used here for the same reason as in Top5ProductsStat.
CREATE OR ALTER VIEW Top5SuppliersStat
AS
WITH RankedData
AS (
SELECT YEAR(p.OrderDate) AS Year, s.SupplierName, SUM(pl.ReceivedOuters * pl.ExpectedUnitPricePerOuter) AS Total, DENSE_RANK() OVER w AS Pos
FROM Warehouse.StockItems si
JOIN Purchasing.PurchaseOrderLines pl
ON
    si.StockItemID = pl.StockItemID
JOIN Purchasing.PurchaseOrders p
ON
    pl.PurchaseOrderID = p.PurchaseOrderID
JOIN Purchasing.Suppliers s
ON
    p.SupplierID = s.SupplierID
GROUP BY
    YEAR(p.OrderDate), s.SupplierName
WINDOW w AS (
PARTITION BY YEAR(p.OrderDate)
ORDER BY
    SUM(pl.ReceivedOuters * pl.ExpectedUnitPricePerOuter)
)
)
SELECT *
FROM RankedData
WHERE Pos <= 5
GO
