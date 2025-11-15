-- Before, restore WideWorldImporters database with "WWICorp" as its name.
-- After that, execute wwisj_structure.sql and wwilm_structure.sql
USE WWICorp
GO
-- ============================== FRAGMENTATION ===============================


-- The tables SupplierTransactions, PurchaseOrders, PurchaseOrderLines,
-- CustomerTransactions, Orders, OrderLines, Invoices, InvoiceLines,
-- StockItemHoldings and StockItemTransactions need a column to
-- distinguish whether a given row belongs to SJ or LM. To do it,
-- execute the following:
ALTER TABLE WWICorp.Purchasing.SupplierTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWICorp.Purchasing.PurchaseOrders ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWICorp.Sales.CustomerTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWICorp.Sales.Orders ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWICorp.Sales.OrderLines ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWICorp.Sales.Invoices ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWICorp.Warehouse.StockItemHoldings ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWICorp.Warehouse.StockItemTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT ''
ALTER TABLE WWISJ.Purchasing.SupplierTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Purchasing.SupplierTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
ALTER TABLE WWISJ.Purchasing.PurchaseOrders ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Purchasing.PurchaseOrders ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
ALTER TABLE WWISJ.Sales.CustomerTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Sales.CustomerTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
ALTER TABLE WWISJ.Sales.Orders ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Sales.Orders ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
ALTER TABLE WWISJ.Sales.OrderLines ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Sales.OrderLines ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
ALTER TABLE WWISJ.Sales.Invoices ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Sales.Invoices ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
ALTER TABLE WWISJ.Warehouse.StockItemHoldings ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Warehouse.StockItemHoldings ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
ALTER TABLE WWISJ.Warehouse.StockItemTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT 'SJ'
ALTER TABLE WWILM.Warehouse.StockItemTransactions ADD Branch VARCHAR(3) NOT NULL DEFAULT 'LM'
GO


-- ============================== Application schema ==========================

-- SystemParameters: Not fragmented. Left in Corp.

-- People: Replicated in all DDBBs.
INSERT INTO WWISJ.Application.People (PersonID, FullName, PreferredName, IsPermittedToLogon, LogonName, IsExternalLogonProvider, HashedPassword, IsSystemUser, IsEmployee, IsSalesPerson, UserPreferences, PhoneNumber, FaxNumber, EmailAddress, Photo, CustomFields, LastEditedBy)
SELECT PersonID, FullName, PreferredName, IsPermittedToLogon, LogonName, IsExternalLogonProvider, HashedPassword, IsSystemUser, IsEmployee, IsSalesPerson, UserPreferences, PhoneNumber, FaxNumber, EmailAddress, Photo, CustomFields, LastEditedBy
FROM WWICorp.Application.People
GO
INSERT INTO WWILM.Application.People (PersonID, FullName, PreferredName, IsPermittedToLogon, LogonName, IsExternalLogonProvider, HashedPassword, IsSystemUser, IsEmployee, IsSalesPerson, UserPreferences, PhoneNumber, FaxNumber, EmailAddress, Photo, CustomFields, LastEditedBy)
SELECT PersonID, FullName, PreferredName, IsPermittedToLogon, LogonName, IsExternalLogonProvider, HashedPassword, IsSystemUser, IsEmployee, IsSalesPerson, UserPreferences, PhoneNumber, FaxNumber, EmailAddress, Photo, CustomFields, LastEditedBy
FROM WWICorp.Application.People
GO

-- Countries: Replicated in all DDBBs.
INSERT INTO WWISJ.Application.Countries (CountryID, CountryName, FormalName, IsoAlpha3Code, IsoNumericCode, CountryType, LatestRecordedPopulation, Continent, Region, Subregion, Border, LastEditedBy)
SELECT CountryID, CountryName, FormalName, IsoAlpha3Code, IsoNumericCode, CountryType, LatestRecordedPopulation, Continent, Region, Subregion, Border, LastEditedBy
FROM WWICorp.Application.Countries
GO
INSERT INTO WWILM.Application.Countries (CountryID, CountryName, FormalName, IsoAlpha3Code, IsoNumericCode, CountryType, LatestRecordedPopulation, Continent, Region, Subregion, Border, LastEditedBy)
SELECT CountryID, CountryName, FormalName, IsoAlpha3Code, IsoNumericCode, CountryType, LatestRecordedPopulation, Continent, Region, Subregion, Border, LastEditedBy
FROM WWICorp.Application.Countries
GO

-- StateProvinces: Replicated in all DDBBs.
INSERT INTO WWISJ.Application.StateProvinces (StateProvinceID, StateProvinceCode, StateProvinceName, CountryID, SalesTerritory, Border, LatestRecordedPopulation, LastEditedBy)
SELECT StateProvinceID, StateProvinceCode, StateProvinceName, CountryID, SalesTerritory, Border, LatestRecordedPopulation, LastEditedBy
FROM WWICorp.Application.StateProvinces
GO
INSERT INTO WWILM.Application.StateProvinces (StateProvinceID, StateProvinceCode, StateProvinceName, CountryID, SalesTerritory, Border, LatestRecordedPopulation, LastEditedBy)
SELECT StateProvinceID, StateProvinceCode, StateProvinceName, CountryID, SalesTerritory, Border, LatestRecordedPopulation, LastEditedBy
FROM WWICorp.Application.StateProvinces
GO

-- Cities: Replicated in all DDBBs.
INSERT INTO WWISJ.Application.Cities (CityID, CityName, StateProvinceID, Location, LatestRecordedPopulation, LastEditedBy)
SELECT CityID, CityName, StateProvinceID, Location, LatestRecordedPopulation, LastEditedBy
FROM WWICorp.Application.Cities
GO
INSERT INTO WWILM.Application.Cities (CityID, CityName, StateProvinceID, Location, LatestRecordedPopulation, LastEditedBy)
SELECT CityID, CityName, StateProvinceID, Location, LatestRecordedPopulation, LastEditedBy
FROM WWICorp.Application.Cities
GO

-- DeliveryMethods: Replicated in all DDBBs.
INSERT INTO WWISJ.Application.DeliveryMethods (DeliveryMethodID, DeliveryMethodName, LastEditedBy)
SELECT DeliveryMethodID, DeliveryMethodName, LastEditedBy
FROM WWICorp.Application.DeliveryMethods
GO
INSERT INTO WWILM.Application.DeliveryMethods (DeliveryMethodID, DeliveryMethodName, LastEditedBy)
SELECT DeliveryMethodID, DeliveryMethodName, LastEditedBy
FROM WWICorp.Application.DeliveryMethods
GO

-- PaymentMethods: Replicated in all DDBBs.
INSERT INTO WWISJ.Application.PaymentMethods (PaymentMethodID, PaymentMethodName, LastEditedBy)
SELECT PaymentMethodID, PaymentMethodName, LastEditedBy
FROM WWICorp.Application.PaymentMethods
GO
INSERT INTO WWILM.Application.PaymentMethods (PaymentMethodID, PaymentMethodName, LastEditedBy)
SELECT PaymentMethodID, PaymentMethodName, LastEditedBy
FROM WWICorp.Application.PaymentMethods
GO

-- TransactionTypes: Replicated in all DDBBs.
INSERT INTO WWISJ.Application.TransactionTypes (TransactionTypeID, TransactionTypeName, LastEditedBy)
SELECT TransactionTypeID, TransactionTypeName, LastEditedBy
FROM WWICORP.Application.TransactionTypes
GO
INSERT INTO WWILM.Application.TransactionTypes (TransactionTypeID, TransactionTypeName, LastEditedBy)
SELECT TransactionTypeID, TransactionTypeName, LastEditedBy
FROM WWICORP.Application.TransactionTypes
GO


-- ============================== Purchasing schema ==========================

-- SupplierCategories: Replicated in all DDBBs.
INSERT INTO WWISJ.Purchasing.SupplierCategories (SupplierCategoryID, SupplierCategoryName, LastEditedBy)
SELECT SupplierCategoryID, SupplierCategoryName, LastEditedBy
FROM WWICORP.Purchasing.SupplierCategories
GO
INSERT INTO WWILM.Purchasing.SupplierCategories (SupplierCategoryID, SupplierCategoryName, LastEditedBy)
SELECT SupplierCategoryID, SupplierCategoryName, LastEditedBy
FROM WWICORP.Purchasing.SupplierCategories
GO

-- Suppliers: Replicated in all DDBBs.
INSERT INTO WWISJ.Purchasing.Suppliers (SupplierID, SupplierName, SupplierCategoryID, PrimaryContactPersonID, AlternateContactPersonID, DeliveryMethodID, DeliveryCityID, PostalCityID, SupplierReference, BankAccountName, BankAccountBranch, BankAccountCode, BankAccountNumber, BankInternationalCode, PaymentDays, InternalComments, PhoneNumber, FaxNumber, WebsiteURL, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryPostalCode, DeliveryLocation, PostalAddressLine1, PostalAddressLine2, PostalPostalCode, LastEditedBy)
SELECT SupplierID, SupplierName, SupplierCategoryID, PrimaryContactPersonID, AlternateContactPersonID, DeliveryMethodID, DeliveryCityID, PostalCityID, SupplierReference, BankAccountName, BankAccountBranch, BankAccountCode, BankAccountNumber, BankInternationalCode, PaymentDays, InternalComments, PhoneNumber, FaxNumber, WebsiteURL, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryPostalCode, DeliveryLocation, PostalAddressLine1, PostalAddressLine2, PostalPostalCode, LastEditedBy
FROM WWICORP.Purchasing.Suppliers
GO
INSERT INTO WWILM.Purchasing.Suppliers (SupplierID, SupplierName, SupplierCategoryID, PrimaryContactPersonID, AlternateContactPersonID, DeliveryMethodID, DeliveryCityID, PostalCityID, SupplierReference, BankAccountName, BankAccountBranch, BankAccountCode, BankAccountNumber, BankInternationalCode, PaymentDays, InternalComments, PhoneNumber, FaxNumber, WebsiteURL, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryPostalCode, DeliveryLocation, PostalAddressLine1, PostalAddressLine2, PostalPostalCode, LastEditedBy)
SELECT SupplierID, SupplierName, SupplierCategoryID, PrimaryContactPersonID, AlternateContactPersonID, DeliveryMethodID, DeliveryCityID, PostalCityID, SupplierReference, BankAccountName, BankAccountBranch, BankAccountCode, BankAccountNumber, BankInternationalCode, PaymentDays, InternalComments, PhoneNumber, FaxNumber, WebsiteURL, DeliveryAddressLine1, DeliveryAddressLine2, DeliveryPostalCode, DeliveryLocation, PostalAddressLine1, PostalAddressLine2, PostalPostalCode, LastEditedBy
FROM WWICORP.Purchasing.Suppliers
GO

-- SupplierTransactions: Existing supplier transactions will remain in Corp.
-- Later, new transactions will be stored only in the current branch and
-- replicated in Corp to generate statistics. Exactly the same is done with
-- PurchaseOrders and PurchaseOrderLines.


-- ============================== Warehouse schema ==========================

-- StockGroups: Replicated in all DDBBs.
INSERT INTO WWISJ.Warehouse.StockGroups (StockGroupID, StockGroupName, LastEditedBy)
SELECT StockGroupID, StockGroupName, LastEditedBy
FROM WWICORP.Warehouse.StockGroups
GO
INSERT INTO WWILM.Warehouse.StockGroups (StockGroupID, StockGroupName, LastEditedBy)
SELECT StockGroupID, StockGroupName, LastEditedBy
FROM WWICORP.Warehouse.StockGroups
GO

-- Colors: Replicated in all DDBBs.
INSERT INTO WWISJ.Warehouse.Colors (ColorID, ColorName, LastEditedBy)
SELECT ColorID, ColorName, LastEditedBy
FROM WWICORP.Warehouse.Colors
GO
INSERT INTO WWILM.Warehouse.Colors (ColorID, ColorName, LastEditedBy)
SELECT ColorID, ColorName, LastEditedBy
FROM WWICORP.Warehouse.Colors
GO

-- PackageTypes: Replicated in all DDBBs.
INSERT INTO WWISJ.Warehouse.PackageTypes (PackageTypeID, PackageTypeName, LastEditedBy)
SELECT PackageTypeID, PackageTypeName, LastEditedBy
FROM WWICORP.Warehouse.PackageTypes
GO
INSERT INTO WWILM.Warehouse.PackageTypes (PackageTypeID, PackageTypeName, LastEditedBy)
SELECT PackageTypeID, PackageTypeName, LastEditedBy
FROM WWICORP.Warehouse.PackageTypes
GO

-- VehicleTemperatures: Replicated in all DDBBs.
-- This is a memory optimized table, so we are going to use an intermediary table. To copy
-- it to branches, we are going to use the bcp tool that comes with SQL Server because
-- the other methods didn't work.
-- In powershell, execute this:
-- bcp WWICorp.Warehouse.VehicleTemperatures out vt.dat -n -S localhost -T
-- bcp WWISJ.Warehouse.VehicleTemperatures in vt.dat -n -S localhost -T
-- bcp WWILM.Warehouse.VehicleTemperatures in vt.dat -n -S localhost -T

-- ColdRoomTemperatures: Replicated in all DDBBs.
-- Happens the same as in VehicleTemperatures. Execute this:
-- bcp WWICorp.Warehouse.ColdRoomTemperatures out crt.dat -n -S localhost -T
-- bcp WWISJ.Warehouse.ColdRoomTemperatures in crt.dat -n -S localhost -T
-- bcp WWILM.Warehouse.ColdRoomTemperatures in crt.dat -n -S localhost -T

-- StockItems: Replicated in all DDBBs.
INSERT INTO WWISJ.Warehouse.StockItems (StockItemID, StockItemName, SupplierID, ColorID, UnitPackageID, OuterPackageID, Brand, Size, LeadTimeDays, QuantityPerOuter, IsChillerStock, Barcode, TaxRate, UnitPrice, RecommendedRetailPrice, TypicalWeightPerUnit, MarketingComments, InternalComments, Photo, CustomFields, LastEditedBy)
SELECT StockItemID, StockItemName, SupplierID, ColorID, UnitPackageID, OuterPackageID, Brand, Size, LeadTimeDays, QuantityPerOuter, IsChillerStock, Barcode, TaxRate, UnitPrice, RecommendedRetailPrice, TypicalWeightPerUnit, MarketingComments, InternalComments, Photo, CustomFields, LastEditedBy
FROM WWICorp.Warehouse.StockItems
GO
INSERT INTO WWILM.Warehouse.StockItems (StockItemID, StockItemName, SupplierID, ColorID, UnitPackageID, OuterPackageID, Brand, Size, LeadTimeDays, QuantityPerOuter, IsChillerStock, Barcode, TaxRate, UnitPrice, RecommendedRetailPrice, TypicalWeightPerUnit, MarketingComments, InternalComments, Photo, CustomFields, LastEditedBy)
SELECT StockItemID, StockItemName, SupplierID, ColorID, UnitPackageID, OuterPackageID, Brand, Size, LeadTimeDays, QuantityPerOuter, IsChillerStock, Barcode, TaxRate, UnitPrice, RecommendedRetailPrice, TypicalWeightPerUnit, MarketingComments, InternalComments, Photo, CustomFields, LastEditedBy
FROM WWICorp.Warehouse.StockItems
GO

-- StockItemHoldings: Every branch is going to have its own inventory, and for current stock, it is
-- going to be distributed 50/50 in the two branches.
DECLARE @midpoint AS INT
SELECT @midpoint = COUNT(*) / 2 FROM WWICorp.Warehouse.StockItemHoldings
INSERT INTO WWISJ.Warehouse.StockItemHoldings (StockItemID, QuantityOnHand, BinLocation, LastStocktakeQuantity, LastCostPrice, ReorderLevel, TargetStockLevel, LastEditedBy, LastEditedWhen, Branch)
SELECT StockItemID, QuantityOnHand, BinLocation, LastStocktakeQuantity, LastCostPrice, ReorderLevel, TargetStockLevel, LastEditedBy, LastEditedWhen, Branch
FROM WWICorp.Warehouse.StockItemHoldings
WHERE StockItemID <= @midpoint
INSERT INTO WWILM.Warehouse.StockItemHoldings (StockItemID, QuantityOnHand, BinLocation, LastStocktakeQuantity, LastCostPrice, ReorderLevel, TargetStockLevel, LastEditedBy, LastEditedWhen, Branch)
SELECT StockItemID, QuantityOnHand, BinLocation, LastStocktakeQuantity, LastCostPrice, ReorderLevel, TargetStockLevel, LastEditedBy, LastEditedWhen, Branch
FROM WWICorp.Warehouse.StockItemHoldings
WHERE StockItemID > @midpoint
GO

-- StockItemStockGroups: Replicated in all DDBBs.
INSERT INTO WWISJ.Warehouse.StockItemStockGroups (StockItemStockGroupID, StockItemID, StockGroupID, LastEditedBy, LastEditedWhen)
SELECT StockItemStockGroupID, StockItemID, StockGroupID, LastEditedBy, LastEditedWhen
FROM WWICorp.Warehouse.StockItemStockGroups
GO
INSERT INTO WWILM.Warehouse.StockItemStockGroups (StockItemStockGroupID, StockItemID, StockGroupID, LastEditedBy, LastEditedWhen)
SELECT StockItemStockGroupID, StockItemID, StockGroupID, LastEditedBy, LastEditedWhen
FROM WWICorp.Warehouse.StockItemStockGroups
GO

-- StockItemTransactions: Existing stock item transactions will remain in Corp.
-- Later, new transactions will be stored only in the current branch and
-- replicated in Corp to generate statistics.


-- ============================== Sales schema ==========================

-- CustomerCategories: Replicated in all DDBBS.
INSERT INTO WWISJ.Sales.CustomerCategories (CustomerCategoryID, CustomerCategoryName, LastEditedBy)
SELECT CustomerCategoryID, CustomerCategoryName, LastEditedBy
FROM WWICORP.Sales.CustomerCategories
GO
INSERT INTO WWILM.Sales.CustomerCategories (CustomerCategoryID, CustomerCategoryName, LastEditedBy)
SELECT CustomerCategoryID, CustomerCategoryName, LastEditedBy
FROM WWICORP.Sales.CustomerCategories
GO

-- BuyingGroups: Replicated in all DDBBS.
INSERT INTO WWISJ.Sales.BuyingGroups (BuyingGroupID, BuyingGroupName, LastEditedBy)
SELECT BuyingGroupID, BuyingGroupName, LastEditedBy
FROM WWICORP.Sales.BuyingGroups
GO
INSERT INTO WWILM.Sales.BuyingGroups (BuyingGroupID, BuyingGroupName, LastEditedBy)
SELECT BuyingGroupID, BuyingGroupName, LastEditedBy
FROM WWICORP.Sales.BuyingGroups
GO

-- Customers: Replicated in all DDBBs. The table structure modifications to keep
-- sensible data only in Corp has already been done in wwisj_structure.sql and
-- wwisj_structure.sql
INSERT INTO WWISJ.Sales.Customers (CustomerID, CustomerName, BillToCustomerID, CustomerCategoryID, BuyingGroupID, DeliveryMethodID, CreditLimit, AccountOpenedDate, StandardDiscountPercentage, IsStatementSent, IsOnCreditHold, PaymentDays, DeliveryRun, RunPosition, WebsiteURL, LastEditedBy)
SELECT CustomerID, CustomerName, BillToCustomerID, CustomerCategoryID, BuyingGroupID, DeliveryMethodID, CreditLimit, AccountOpenedDate, StandardDiscountPercentage, IsStatementSent, IsOnCreditHold, PaymentDays, DeliveryRun, RunPosition, WebsiteURL, LastEditedBy
FROM WWICORP.Sales.Customers
GO
INSERT INTO WWILM.Sales.Customers (CustomerID, CustomerName, BillToCustomerID, CustomerCategoryID, BuyingGroupID, DeliveryMethodID, CreditLimit, AccountOpenedDate, StandardDiscountPercentage, IsStatementSent, IsOnCreditHold, PaymentDays, DeliveryRun, RunPosition, WebsiteURL, LastEditedBy)
SELECT CustomerID, CustomerName, BillToCustomerID, CustomerCategoryID, BuyingGroupID, DeliveryMethodID, CreditLimit, AccountOpenedDate, StandardDiscountPercentage, IsStatementSent, IsOnCreditHold, PaymentDays, DeliveryRun, RunPosition, WebsiteURL, LastEditedBy
FROM WWICORP.Sales.Customers
GO

-- SpecialDeals: Replicated in all DDBBs.
INSERT INTO WWISJ.Sales.SpecialDeals (SpecialDealID, StockItemID, CustomerID, BuyingGroupID, CustomerCategoryID, StockGroupID, DealDescription, StartDate, EndDate, DiscountAmount, DiscountPercentage, UnitPrice, LastEditedBy, LastEditedWhen)
SELECT SpecialDealID, StockItemID, CustomerID, BuyingGroupID, CustomerCategoryID, StockGroupID, DealDescription, StartDate, EndDate, DiscountAmount, DiscountPercentage, UnitPrice, LastEditedBy, LastEditedWhen
FROM WWICORP.Sales.SpecialDeals
GO
INSERT INTO WWILM.Sales.SpecialDeals (SpecialDealID, StockItemID, CustomerID, BuyingGroupID, CustomerCategoryID, StockGroupID, DealDescription, StartDate, EndDate, DiscountAmount, DiscountPercentage, UnitPrice, LastEditedBy, LastEditedWhen)
SELECT SpecialDealID, StockItemID, CustomerID, BuyingGroupID, CustomerCategoryID, StockGroupID, DealDescription, StartDate, EndDate, DiscountAmount, DiscountPercentage, UnitPrice, LastEditedBy, LastEditedWhen
FROM WWICORP.Sales.SpecialDeals
GO

-- CustomerTransactions: Existing customer transactions will remain in Corp.
-- Later, new transactions will be stored only in the current branch and
-- replicated in Corp to generate statistics. Exactly the same is done with
-- PurchaseOrders and PurchaseOrderLines.

-- Just for the record, we heavily used transactions to avoid delete all records every time something went wrong.
--BEGIN TRANSACTION
--COMMIT TRANSACTION
--ROLLBACK TRANSACTION
-- Done by Jimena and Ricardo. It took almost 2 full days.