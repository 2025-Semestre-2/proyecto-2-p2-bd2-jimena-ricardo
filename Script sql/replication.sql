-- This just disables system versioning for all tables.
-- Run the alters for every database.

--USE WWICorp
--USE WWISJ
--USE WWILM
GO

ALTER TABLE [Application].[Cities] SET (SYSTEM_VERSIONING = OFF);
GO
ALTER TABLE [Application].[Cities] DROP PERIOD FOR SYSTEM_TIME;
GO 

ALTER TABLE [Application].[Countries] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Application].[Countries] DROP PERIOD FOR SYSTEM_TIME; 
GO

ALTER TABLE [Application].[DeliveryMethods] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Application].[DeliveryMethods] DROP PERIOD FOR SYSTEM_TIME;
GO

ALTER TABLE [Application].[PaymentMethods] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Application].[PaymentMethods] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Application].[People] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Application].[People] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Application].[StateProvinces] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Application].[StateProvinces] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Application].[TransactionTypes] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Application].[TransactionTypes] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Purchasing].[SupplierCategories] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Purchasing].[SupplierCategories] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Purchasing].[Suppliers] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Purchasing].[Suppliers] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Sales].[BuyingGroups] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Sales].[BuyingGroups] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Sales].[CustomerCategories] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Sales].[CustomerCategories] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Sales].[Customers] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Sales].[Customers] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Warehouse].[Colors] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Warehouse].[Colors] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Warehouse].[PackageTypes] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Warehouse].[PackageTypes] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Warehouse].[StockGroups] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Warehouse].[StockGroups] DROP PERIOD FOR SYSTEM_TIME;
GO 
 
ALTER TABLE [Warehouse].[StockItems] SET (SYSTEM_VERSIONING = OFF);
GO 
ALTER TABLE [Warehouse].[StockItems] DROP PERIOD FOR SYSTEM_TIME;
GO 
 