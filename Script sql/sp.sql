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

CREATE OR ALTER PROCEDURE GetInvoiceHeader
    @invoiceID INT
AS
SELECT InvoiceID, CustomerName, DeliveryMethod, OrderNumber, ContactPerson, SalesPerson, InvoiceDate, DeliveryInstructions
FROM InvoiceHeaderData
WHERE InvoiceID = @invoiceID
GO

CREATE OR ALTER PROCEDURE GetInvoiceLines
    @invoiceID INT
AS
SELECT ProductName, Quantity, UnitPrice, TaxRate, TaxAmount, Total
FROM InvoiceLinesData
WHERE InvoiceID = @invoiceID
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
    @pageNumber INT, @pageSize INT
AS
SELECT CategoryName, SupplierName, Minimum, Maximum, Average
FROM PurchaseOrderStat
ORDER BY
    CategoryName, SupplierName
OFFSET (@pageNumber-1) * @PageSize ROWS
FETCH NEXT @pageSize ROWS ONLY
GO

CREATE OR ALTER PROCEDURE GetInvoiceStat
    @pageNumber INT, @pageSize INT
AS
SELECT CategoryName, CustomerName, Minimum, Maximum, Average
FROM InvoiceStat
ORDER BY
    CategoryName, CustomerName
OFFSET (@pageNumber-1) * @PageSize ROWS
FETCH NEXT @pageSize ROWS ONLY
GO

CREATE OR ALTER PROCEDURE GetTop5ProductsStat
AS
SELECT Year, ProductName, Total, Pos
FROM Top5ProductsStat
GO

CREATE OR ALTER PROCEDURE GetTop5CustomersStat
AS
SELECT Year, CustomerName, Total, Pos
FROM Top5CustomersStat
GO

CREATE OR ALTER PROCEDURE GetTop5SuppliersStat
AS
SELECT Year, SupplierName, Total, Pos
FROM Top5SuppliersStat
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
