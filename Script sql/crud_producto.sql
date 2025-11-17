IF OBJECT_ID('sp_GetProveedoresSeleccion', 'P') IS NOT NULL DROP PROCEDURE sp_GetProveedoresSeleccion;
IF OBJECT_ID('sp_GetColores', 'P') IS NOT NULL DROP PROCEDURE sp_GetColores;
IF OBJECT_ID('sp_GetTiposPaquete', 'P') IS NOT NULL DROP PROCEDURE sp_GetTiposPaquete;
IF OBJECT_ID('sp_GetGruposStock', 'P') IS NOT NULL DROP PROCEDURE sp_GetGruposStock;
IF OBJECT_ID('sp_CreateProductoCompleto', 'P') IS NOT NULL DROP PROCEDURE sp_CreateProductoCompleto;
IF OBJECT_ID('sp_UpdateProductoCompleto', 'P') IS NOT NULL DROP PROCEDURE sp_UpdateProductoCompleto;
IF OBJECT_ID('sp_GetProductoEdicion', 'P') IS NOT NULL DROP PROCEDURE sp_GetProductoEdicion;
IF OBJECT_ID('sp_DeleteProducto', 'P') IS NOT NULL DROP PROCEDURE sp_DeleteProducto;
IF OBJECT_ID('sp_TestCRUDProductos', 'P') IS NOT NULL DROP PROCEDURE sp_TestCRUDProductos;
GO

-- Procedimiento para obtener proveedores para combobox
CREATE PROCEDURE sp_GetProveedoresSeleccion
AS
BEGIN
    SELECT 
        SupplierID as id,
        SupplierName as nombre
    FROM Purchasing.Suppliers
    WHERE SupplierName IS NOT NULL
    ORDER BY SupplierName;
END
GO

-- Procedimiento para obtener colores para combobox
CREATE PROCEDURE sp_GetColores
AS
BEGIN
    SELECT 
        ColorID as id,
        ColorName as nombre
    FROM Warehouse.Colors
    WHERE ColorName IS NOT NULL
    ORDER BY ColorName;
END
GO

-- Procedimiento para obtener tipos de paquete para combobox
CREATE PROCEDURE sp_GetTiposPaquete
AS
BEGIN
    SELECT 
        PackageTypeID as id,
        PackageTypeName as nombre
    FROM Warehouse.PackageTypes
    WHERE PackageTypeName IS NOT NULL
    ORDER BY PackageTypeName;
END
GO

-- Procedimiento para obtener grupos de stock para combobox
CREATE PROCEDURE sp_GetGruposStock
AS
BEGIN
    SELECT 
        StockGroupID as id,
        StockGroupName as nombre
    FROM Warehouse.StockGroups
    WHERE StockGroupName IS NOT NULL
    ORDER BY StockGroupName;
END
GO

IF OBJECT_ID('sp_UpdateProductoCompleto', 'P') IS NOT NULL 
    DROP PROCEDURE sp_UpdateProductoCompleto;
GO

CREATE PROCEDURE sp_UpdateProductoCompleto
    @StockItemID INT,
    @StockItemName NVARCHAR(100) = NULL,
    @SupplierName NVARCHAR(100) = NULL,
    @ColorName NVARCHAR(20) = NULL,
    @UnitPackageName NVARCHAR(50) = NULL,
    @OuterPackageName NVARCHAR(50) = NULL,
    @QuantityPerOuter INT = NULL,
    @Brand NVARCHAR(50) = NULL,
    @Size NVARCHAR(20) = NULL,
    @TaxRate DECIMAL(18,3) = NULL,
    @UnitPrice DECIMAL(18,2) = NULL,
    @RecommendedRetailPrice DECIMAL(18,2) = NULL,
    @LeadTimeDays INT = NULL,
    @Barcode NVARCHAR(50) = NULL,
    @IsChillerStock BIT = NULL,
    @TypicalWeightPerUnit DECIMAL(18,3) = NULL,
    @MarketingComments NVARCHAR(MAX) = NULL,
    @InternalComments NVARCHAR(MAX) = NULL,
    @StockGroupNames NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @SupplierID INT, @ColorID INT, @UnitPackageID INT, @OuterPackageID INT;
        DECLARE @LastEditedBy INT = 1;
        DECLARE @FilasAfectadas INT = 0;
        DECLARE @CurrentStockItemName NVARCHAR(100);
        
        -- 1. Verificar que el producto existe y obtener el nombre actual
        IF NOT EXISTS (SELECT 1 FROM Warehouse.StockItems WHERE StockItemID = @StockItemID)
        BEGIN
            RAISERROR('Producto no encontrado con ID: %d', 16, 1, @StockItemID);
            ROLLBACK TRANSACTION;
            RETURN -1;
        END
        
        -- Obtener el nombre actual del producto
        SELECT @CurrentStockItemName = StockItemName 
        FROM Warehouse.StockItems 
        WHERE StockItemID = @StockItemID;
        
        -- 2. Verificar unicidad del nombre si se está cambiando
        IF @StockItemName IS NOT NULL AND @StockItemName != @CurrentStockItemName
        BEGIN
            IF EXISTS (SELECT 1 FROM Warehouse.StockItems WHERE StockItemName = @StockItemName AND StockItemID != @StockItemID)
            BEGIN
                RAISERROR('Ya existe un producto con el nombre: %s', 16, 1, @StockItemName);
                ROLLBACK TRANSACTION;
                RETURN -1;
            END
        END
        
        -- 3. Obtener IDs basados en nombres (solo si se proporcionan)
        IF @SupplierName IS NOT NULL
        BEGIN
            SELECT @SupplierID = SupplierID 
            FROM Purchasing.Suppliers 
            WHERE SupplierName = @SupplierName;
            
            IF @SupplierID IS NULL
            BEGIN
                RAISERROR('Proveedor no encontrado: %s', 16, 1, @SupplierName);
                ROLLBACK TRANSACTION;
                RETURN -1;
            END
        END
        
        IF @ColorName IS NOT NULL
        BEGIN
            SELECT @ColorID = ColorID 
            FROM Warehouse.Colors 
            WHERE ColorName = @ColorName;
        END
        
        IF @UnitPackageName IS NOT NULL
        BEGIN
            SELECT @UnitPackageID = PackageTypeID 
            FROM Warehouse.PackageTypes 
            WHERE PackageTypeName = @UnitPackageName;
            
            IF @UnitPackageID IS NULL
            BEGIN
                RAISERROR('Tipo de paquete unidad no encontrado: %s', 16, 1, @UnitPackageName);
                ROLLBACK TRANSACTION;
                RETURN -1;
            END
        END
        
        IF @OuterPackageName IS NOT NULL
        BEGIN
            SELECT @OuterPackageID = PackageTypeID 
            FROM Warehouse.PackageTypes 
            WHERE PackageTypeName = @OuterPackageName;
            
            IF @OuterPackageID IS NULL
            BEGIN
                RAISERROR('Tipo de paquete externo no encontrado: %s', 16, 1, @OuterPackageName);
                ROLLBACK TRANSACTION;
                RETURN -1;
            END
        END
        
        -- 4. Actualizar producto
        UPDATE Warehouse.StockItems
        SET 
            StockItemName = ISNULL(@StockItemName, StockItemName),
            SupplierID = ISNULL(@SupplierID, SupplierID),
            ColorID = CASE 
                        WHEN @ColorName IS NULL THEN ColorID 
                        WHEN @ColorID IS NULL THEN NULL
                        ELSE @ColorID 
                      END,
            UnitPackageID = ISNULL(@UnitPackageID, UnitPackageID),
            OuterPackageID = ISNULL(@OuterPackageID, OuterPackageID),
            QuantityPerOuter = ISNULL(@QuantityPerOuter, QuantityPerOuter),
            Brand = ISNULL(@Brand, Brand),
            Size = ISNULL(@Size, Size),
            TaxRate = ISNULL(@TaxRate, TaxRate),
            UnitPrice = ISNULL(@UnitPrice, UnitPrice),
            RecommendedRetailPrice = ISNULL(@RecommendedRetailPrice, RecommendedRetailPrice),
            LeadTimeDays = ISNULL(@LeadTimeDays, LeadTimeDays),
            Barcode = ISNULL(@Barcode, Barcode),
            IsChillerStock = ISNULL(@IsChillerStock, IsChillerStock),
            TypicalWeightPerUnit = ISNULL(@TypicalWeightPerUnit, TypicalWeightPerUnit),
            MarketingComments = ISNULL(@MarketingComments, MarketingComments),
            InternalComments = ISNULL(@InternalComments, InternalComments),
            LastEditedBy = @LastEditedBy
        WHERE StockItemID = @StockItemID;

        SET @FilasAfectadas = @@ROWCOUNT;
        
        -- 5. Actualizar barcode en StockItemHoldings si se cambió
        IF @Barcode IS NOT NULL
        BEGIN
            UPDATE Warehouse.StockItemHoldings
            SET BinLocation = @Barcode,
                LastEditedBy = @LastEditedBy
            WHERE StockItemID = @StockItemID;
        END

        -- 6. Actualizar grupos de stock si se proporcionaron
        IF @StockGroupNames IS NOT NULL
        BEGIN
            DELETE FROM Warehouse.StockItemStockGroups 
            WHERE StockItemID = @StockItemID;
            
            DECLARE @StockGroupTable TABLE (GroupName NVARCHAR(50));
            
            INSERT INTO @StockGroupTable (GroupName)
            SELECT LTRIM(RTRIM(value)) 
            FROM STRING_SPLIT(@StockGroupNames, ',')
            WHERE LTRIM(RTRIM(value)) != '';
            
            INSERT INTO Warehouse.StockItemStockGroups (StockItemID, StockGroupID, LastEditedBy)
            SELECT @StockItemID, sg.StockGroupID, @LastEditedBy
            FROM Warehouse.StockGroups sg
            INNER JOIN @StockGroupTable sgt ON sg.StockGroupName = sgt.GroupName;
        END

        COMMIT TRANSACTION;
        
        SELECT @FilasAfectadas AS FilasAfectadas;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        RETURN -1;
    END CATCH
END
GO

CREATE PROCEDURE sp_CreateProductoCompleto
    @StockItemName NVARCHAR(100),
    @SupplierName NVARCHAR(100),
    @ColorName NVARCHAR(20) = NULL,
    @UnitPackageName NVARCHAR(50),
    @OuterPackageName NVARCHAR(50),
    @QuantityPerOuter INT,
    @Brand NVARCHAR(50) = NULL,
    @Size NVARCHAR(20) = NULL,
    @TaxRate DECIMAL(18,3),
    @UnitPrice DECIMAL(18,2),
    @RecommendedRetailPrice DECIMAL(18,2) = NULL,
    @LeadTimeDays INT,
    @Barcode NVARCHAR(50) = NULL,
    @IsChillerStock BIT = 0,
    @TypicalWeightPerUnit DECIMAL(18,3) = 1.0,
    @MarketingComments NVARCHAR(MAX) = NULL,
    @InternalComments NVARCHAR(MAX) = NULL,
    @StockGroupNames NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @SupplierID INT, @ColorID INT, @UnitPackageID INT, @OuterPackageID INT;
        DECLARE @LastEditedBy INT = 1;
        DECLARE @NewStockItemID INT;
        DECLARE @ValidFrom DATETIME2 = SYSUTCDATETIME();
        DECLARE @ValidTo DATETIME2 = DATEFROMPARTS(9999, 12, 31);
        
        SELECT @NewStockItemID = NEXT VALUE FOR [Sequences].[StockItemID];
        
        SELECT @SupplierID = SupplierID 
        FROM Purchasing.Suppliers 
        WHERE SupplierName = @SupplierName;
        
        IF @SupplierID IS NULL
        BEGIN
            RAISERROR('Proveedor no encontrado: %s', 16, 1, @SupplierName);
            ROLLBACK TRANSACTION;
            RETURN -1;
        END
        
        IF @ColorName IS NOT NULL AND @ColorName != ''
        BEGIN
            SELECT @ColorID = ColorID 
            FROM Warehouse.Colors 
            WHERE ColorName = @ColorName;
        END
        
        SELECT @UnitPackageID = PackageTypeID 
        FROM Warehouse.PackageTypes 
        WHERE PackageTypeName = @UnitPackageName;
        
        IF @UnitPackageID IS NULL
        BEGIN
            RAISERROR('Tipo de paquete unidad no encontrado: %s', 16, 1, @UnitPackageName);
            ROLLBACK TRANSACTION;
            RETURN -1;
        END
        
        SELECT @OuterPackageID = PackageTypeID 
        FROM Warehouse.PackageTypes 
        WHERE PackageTypeName = @OuterPackageName;
        
        IF @OuterPackageID IS NULL
        BEGIN
            RAISERROR('Tipo de paquete externo no encontrado: %s', 16, 1, @OuterPackageName);
            ROLLBACK TRANSACTION;
            RETURN -1;
        END
        
        IF @TypicalWeightPerUnit IS NULL OR @TypicalWeightPerUnit = 0
            SET @TypicalWeightPerUnit = 1.0;
            
        IF @RecommendedRetailPrice IS NULL OR @RecommendedRetailPrice = 0
            SET @RecommendedRetailPrice = @UnitPrice * 1.2;
            
        IF @Barcode IS NULL
            SET @Barcode = '';
            
        IF @Brand IS NULL
            SET @Brand = '';
            
        IF @Size IS NULL
            SET @Size = '';
            
        IF @MarketingComments IS NULL
            SET @MarketingComments = '';
            
        IF @InternalComments IS NULL
            SET @InternalComments = '';
        
        INSERT INTO Warehouse.StockItems (
            StockItemID,
            StockItemName, 
            SupplierID, 
            ColorID, 
            UnitPackageID, 
            OuterPackageID,
            QuantityPerOuter, 
            Brand, 
            Size, 
            TaxRate, 
            UnitPrice, 
            RecommendedRetailPrice, 
            LeadTimeDays, 
            Barcode,
            IsChillerStock, 
            TypicalWeightPerUnit, 
            MarketingComments, 
            InternalComments, 
            LastEditedBy,
            ValidFrom,
            ValidTo
        )
        VALUES (
            @NewStockItemID,
            @StockItemName, 
            @SupplierID, 
            @ColorID, 
            @UnitPackageID, 
            @OuterPackageID,
            @QuantityPerOuter, 
            @Brand, 
            @Size, 
            @TaxRate, 
            @UnitPrice,
            @RecommendedRetailPrice, 
            @LeadTimeDays, 
            @Barcode,
            @IsChillerStock, 
            @TypicalWeightPerUnit,
            @MarketingComments, 
            @InternalComments, 
            @LastEditedBy,
            @ValidFrom,
            @ValidTo
        );

        INSERT INTO Warehouse.StockItemHoldings (
            StockItemID, 
            QuantityOnHand, 
            BinLocation, 
            LastStocktakeQuantity,
            LastCostPrice, 
            ReorderLevel, 
            TargetStockLevel, 
            LastEditedBy
        )
        VALUES (
            @NewStockItemID, 
            0, 
            @Barcode, 
            0, 
            @UnitPrice, 
            0, 
            0, 
            @LastEditedBy
        );

        IF @StockGroupNames IS NOT NULL AND LEN(@StockGroupNames) > 0
        BEGIN
            DECLARE @StockGroupTable TABLE (GroupName NVARCHAR(50));
            
            INSERT INTO @StockGroupTable (GroupName)
            SELECT LTRIM(RTRIM(value)) 
            FROM STRING_SPLIT(@StockGroupNames, ',')
            WHERE LTRIM(RTRIM(value)) != '';
            
            INSERT INTO Warehouse.StockItemStockGroups (StockItemID, StockGroupID, LastEditedBy)
            SELECT @NewStockItemID, sg.StockGroupID, @LastEditedBy
            FROM Warehouse.StockGroups sg
            INNER JOIN @StockGroupTable sgt ON sg.StockGroupName = sgt.GroupName;
        END
        ELSE
        BEGIN
            INSERT INTO Warehouse.StockItemStockGroups (StockItemID, StockGroupID, LastEditedBy)
            VALUES (@NewStockItemID, 1, @LastEditedBy);
        END

        COMMIT TRANSACTION;
        
        SELECT @NewStockItemID AS NewStockItemID;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
        RETURN -1;
    END CATCH
END
GO

CREATE PROCEDURE sp_GetProductoEdicion
    @StockItemID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        si.StockItemID,
        si.StockItemName,
        s.SupplierName,
        c.ColorName,
        pt1.PackageTypeName as UnitPackageName,
        pt2.PackageTypeName as OuterPackageName,
        si.QuantityPerOuter,
        si.Brand,
        si.Size,
        si.TaxRate,
        si.UnitPrice,
        si.RecommendedRetailPrice,
        si.LeadTimeDays,
        si.Barcode,
        si.IsChillerStock,
        si.TypicalWeightPerUnit,
        si.MarketingComments,
        si.InternalComments,
        STUFF((
            SELECT ', ' + sg.StockGroupName
            FROM Warehouse.StockItemStockGroups sig
            INNER JOIN Warehouse.StockGroups sg ON sig.StockGroupID = sg.StockGroupID
            WHERE sig.StockItemID = si.StockItemID
            FOR XML PATH('')), 1, 2, '') as StockGroupNames
    FROM Warehouse.StockItems si
    LEFT JOIN Purchasing.Suppliers s ON si.SupplierID = s.SupplierID
    LEFT JOIN Warehouse.Colors c ON si.ColorID = c.ColorID
    LEFT JOIN Warehouse.PackageTypes pt1 ON si.UnitPackageID = pt1.PackageTypeID
    LEFT JOIN Warehouse.PackageTypes pt2 ON si.OuterPackageID = pt2.PackageTypeID
    WHERE si.StockItemID = @StockItemID;
END
GO

-- Procedimiento mejorado para eliminar producto (más permisivo)
CREATE PROCEDURE sp_DeleteProducto
    @StockItemID INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        IF NOT EXISTS (SELECT 1 FROM Warehouse.StockItems WHERE StockItemID = @StockItemID)
        BEGIN
            RAISERROR('El producto no existe.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM Sales.OrderLines WHERE StockItemID = @StockItemID) OR
           EXISTS (SELECT 1 FROM Sales.InvoiceLines WHERE StockItemID = @StockItemID) OR
           EXISTS (SELECT 1 FROM Purchasing.PurchaseOrderLines WHERE StockItemID = @StockItemID)
        BEGIN
            RAISERROR('No se puede eliminar el producto porque tiene registros relacionados en órdenes de venta, facturas u órdenes de compra.', 16, 1);
            RETURN;
        END

        DELETE FROM Warehouse.StockItemStockGroups 
        WHERE StockItemID = @StockItemID;

        DELETE FROM Warehouse.StockItemHoldings 
        WHERE StockItemID = @StockItemID;

        DELETE FROM Warehouse.StockItems 
        WHERE StockItemID = @StockItemID;

        COMMIT TRANSACTION;
        
        SELECT 1 AS Eliminado;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

SELECT name, type_desc 
FROM sys.procedures 
WHERE name IN (
    'sp_GetProveedoresSeleccion',
    'sp_GetColores', 
    'sp_GetTiposPaquete',
    'sp_GetGruposStock',
    'sp_CreateProductoCompleto',
    'sp_UpdateProductoCompleto',
    'sp_GetProductoEdicion',
    'sp_DeleteProducto'
)
ORDER BY name;
GO