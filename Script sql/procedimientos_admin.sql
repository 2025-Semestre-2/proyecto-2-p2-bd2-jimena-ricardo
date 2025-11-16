--USE WWISJ
--USE WWILM
-- IMPORTANTE: Primero ejecutar vistas_admin.sql
GO

-- Eliminar procedimientos existentes si existen
IF OBJECT_ID('sp_GetClientes', 'P') IS NOT NULL DROP PROCEDURE sp_GetClientes;
IF OBJECT_ID('sp_GetClienteDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetClienteDetalles;
IF OBJECT_ID('sp_GetProveedores', 'P') IS NOT NULL DROP PROCEDURE sp_GetProveedores;
IF OBJECT_ID('sp_GetProveedorDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetProveedorDetalles;
IF OBJECT_ID('sp_GetInventarios', 'P') IS NOT NULL DROP PROCEDURE sp_GetInventarios;
IF OBJECT_ID('sp_GetProductoDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetProductoDetalles;
IF OBJECT_ID('sp_GetVentas', 'P') IS NOT NULL DROP PROCEDURE sp_GetVentas;
IF OBJECT_ID('sp_GetVentaDetalles', 'P') IS NOT NULL DROP PROCEDURE sp_GetVentaDetalles;
IF OBJECT_ID('sp_EstadisticasComprasProveedores', 'P') IS NOT NULL DROP PROCEDURE sp_EstadisticasComprasProveedores;
IF OBJECT_ID('sp_EstadisticasVentasClientes', 'P') IS NOT NULL DROP PROCEDURE sp_EstadisticasVentasClientes;
IF OBJECT_ID('sp_Top5ProductosGanancia', 'P') IS NOT NULL DROP PROCEDURE sp_Top5ProductosGanancia;
IF OBJECT_ID('sp_Top5ClientesFacturas', 'P') IS NOT NULL DROP PROCEDURE sp_Top5ClientesFacturas;
IF OBJECT_ID('sp_Top5ProveedoresOrdenes', 'P') IS NOT NULL DROP PROCEDURE sp_Top5ProveedoresOrdenes;

-- Procedimientos de conteo para paginación
IF OBJECT_ID('sp_GetTotalClientes', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalClientes;
IF OBJECT_ID('sp_GetTotalProveedores', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalProveedores;
IF OBJECT_ID('sp_GetTotalInventarios', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalInventarios;
IF OBJECT_ID('sp_GetTotalVentas', 'P') IS NOT NULL DROP PROCEDURE sp_GetTotalVentas;
GO

CREATE PROCEDURE sp_GetClientes
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT 
        c.CustomerID as id,
        c.CustomerName as nombre,
        cat.CustomerCategoryName as categoria,
        dm.DeliveryMethodName as metodo_entrega
    FROM Sales.Customers c
    INNER JOIN Sales.CustomerCategories cat ON c.CustomerCategoryID = cat.CustomerCategoryID
    INNER JOIN Application.DeliveryMethods dm ON c.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR c.CustomerName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR cat.CustomerCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%')
    ORDER BY c.CustomerName ASC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalClientes
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT COUNT(*) as Total
    FROM Sales.Customers c
    INNER JOIN Sales.CustomerCategories cat ON c.CustomerCategoryID = cat.CustomerCategoryID
    INNER JOIN Application.DeliveryMethods dm ON c.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR c.CustomerName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR cat.CustomerCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%');
END
GO

CREATE OR ALTER PROCEDURE sp_GetClienteDetalles
    @CustomerID INT
AS
BEGIN
    SELECT 
        c.CustomerID,
        c.CustomerName as nombre_cliente,
        cc.CustomerCategoryName as categoria,
        bg.BuyingGroupName as grupo_compra,
        c.BillToCustomerID as cliente_facturar,
        dm.DeliveryMethodName as metodo_entrega,
        c.CreditLimit as limite_credito,
        c.AccountOpenedDate as fecha_apertura_cuenta,
        c.StandardDiscountPercentage as descuento_estandar,
        c.IsStatementSent as estado_cuenta_enviado,
        c.IsOnCreditHold as credito_retenido,
        c.PaymentDays as dias_pago,
        c.DeliveryRun as ruta_entrega,
        c.RunPosition as posicion_ruta,
        c.WebsiteURL as sitio_web
    FROM Sales.Customers c
    LEFT JOIN Sales.CustomerCategories cc ON c.CustomerCategoryID = cc.CustomerCategoryID
    LEFT JOIN Application.DeliveryMethods dm ON c.DeliveryMethodID = dm.DeliveryMethodID
    LEFT JOIN Sales.BuyingGroups bg ON c.BuyingGroupID = bg.BuyingGroupID
    WHERE c.CustomerID = @CustomerID;
END
GO

CREATE PROCEDURE sp_GetProveedores
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT 
        s.SupplierID as id,
        s.SupplierName as nombre,
        sc.SupplierCategoryName as categoria,
        dm.DeliveryMethodName as metodo_entrega
    FROM Purchasing.Suppliers s
    INNER JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
    INNER JOIN Application.DeliveryMethods dm ON s.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR s.SupplierName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR sc.SupplierCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%')
    ORDER BY s.SupplierName ASC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalProveedores
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroCategoria NVARCHAR(100) = NULL,
    @FiltroMetodoEntrega NVARCHAR(100) = NULL
AS
BEGIN
    SELECT COUNT(*) as Total
    FROM Purchasing.Suppliers s
    INNER JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
    INNER JOIN Application.DeliveryMethods dm ON s.DeliveryMethodID = dm.DeliveryMethodID
    WHERE (@FiltroNombre IS NULL OR s.SupplierName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroCategoria IS NULL OR sc.SupplierCategoryName LIKE '%' + @FiltroCategoria + '%')
    AND (@FiltroMetodoEntrega IS NULL OR dm.DeliveryMethodName LIKE '%' + @FiltroMetodoEntrega + '%');
END
GO

CREATE PROCEDURE sp_GetProveedorDetalles
    @SupplierID INT
AS
BEGIN
    SELECT 
        s.SupplierID,
        s.SupplierReference as codigo_proveedor,
        s.SupplierName as nombre_proveedor,
        sc.SupplierCategoryName as categoria,
        p.FullName as contacto_primario,
        p2.FullName as contacto_alternativo,
        dm.DeliveryMethodName as metodo_entrega,
        city.CityName as ciudad_entrega,
        s.DeliveryPostalCode as codigo_postal_entrega,
        s.PhoneNumber as telefono,
        s.FaxNumber as fax,
        s.WebsiteURL as sitio_web,
        s.DeliveryAddressLine1 as direccion_entrega,
        s.DeliveryAddressLine2 as direccion_entrega2,
        s.BankAccountName as nombre_banco,
        s.BankAccountCode as numero_cuenta,
        s.PaymentDays as dias_gracia_pago,
        s.DeliveryLocation.Lat as latitud,
        s.DeliveryLocation.Long as longitud
    FROM Purchasing.Suppliers s
    INNER JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
    INNER JOIN Application.DeliveryMethods dm ON s.DeliveryMethodID = dm.DeliveryMethodID
    INNER JOIN Application.People p ON s.PrimaryContactPersonID = p.PersonID
    LEFT JOIN Application.People p2 ON s.AlternateContactPersonID = p2.PersonID
    INNER JOIN Application.Cities city ON s.DeliveryCityID = city.CityID
    WHERE s.SupplierID = @SupplierID;
END
GO

CREATE PROCEDURE sp_GetInventarios
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroGrupo NVARCHAR(100) = NULL,
    @CantidadMin INT = NULL
AS
BEGIN
    WITH ProductosConGrupos AS (
        SELECT DISTINCT
            si.StockItemID,
            si.StockItemName,
            si.Brand,
            sih.QuantityOnHand,
            STUFF((
                SELECT ', ' + sg.StockGroupName
                FROM Warehouse.StockItemStockGroups sig
                INNER JOIN Warehouse.StockGroups sg ON sig.StockGroupID = sg.StockGroupID
                WHERE sig.StockItemID = si.StockItemID
                FOR XML PATH('')), 1, 2, '') as Grupos
        FROM Warehouse.StockItems si
        INNER JOIN Warehouse.StockItemHoldings sih ON si.StockItemID = sih.StockItemID
    )
    SELECT 
        StockItemID as id,
        StockItemName as nombre_producto,
        Brand as marca,
        Grupos as grupo,
        QuantityOnHand as cantidad_inventario
    FROM ProductosConGrupos
    WHERE (@FiltroNombre IS NULL OR StockItemName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroGrupo IS NULL OR Grupos LIKE '%' + @FiltroGrupo + '%')
    AND (@CantidadMin IS NULL OR QuantityOnHand >= @CantidadMin)
    ORDER BY StockItemName
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalInventarios
    @FiltroNombre NVARCHAR(100) = NULL,
    @FiltroGrupo NVARCHAR(100) = NULL,
    @CantidadMin INT = NULL
AS
BEGIN
    WITH ProductosConGrupos AS (
        SELECT DISTINCT
            si.StockItemID,
            si.StockItemName,
            sih.QuantityOnHand,
            STUFF((
                SELECT ', ' + sg.StockGroupName
                FROM Warehouse.StockItemStockGroups sig
                INNER JOIN Warehouse.StockGroups sg ON sig.StockGroupID = sg.StockGroupID
                WHERE sig.StockItemID = si.StockItemID
                FOR XML PATH('')), 1, 2, '') as Grupos
        FROM Warehouse.StockItems si
        INNER JOIN Warehouse.StockItemHoldings sih ON si.StockItemID = sih.StockItemID
    )
    SELECT COUNT(*) as Total
    FROM ProductosConGrupos
    WHERE (@FiltroNombre IS NULL OR StockItemName LIKE '%' + @FiltroNombre + '%')
    AND (@FiltroGrupo IS NULL OR Grupos LIKE '%' + @FiltroGrupo + '%')
    AND (@CantidadMin IS NULL OR QuantityOnHand >= @CantidadMin);
END
GO

CREATE OR ALTER PROCEDURE sp_GetProductoDetalles
    @StockItemID INT
AS
BEGIN
    SELECT 
        si.StockItemID,
        si.StockItemName as nombre_producto,
        s.SupplierName as nombre_proveedor,
        s.SupplierID as proveedor_id,
        c.ColorName as color,
        pt.PackageTypeName as unidad_empaquetamiento,
        pt2.PackageTypeName as empaquetamiento_externo,
        si.QuantityPerOuter as cantidad_empaquetamiento,
        si.Brand as marca,
        si.Size as tamano,
        si.TaxRate as impuesto,
        si.UnitPrice as precio_unitario,
        si.RecommendedRetailPrice as precio_venta,
        si.LeadTimeDays as paso,
        si.IsChillerStock as refrigerado,
        si.TypicalWeightPerUnit as peso_typical,
        si.MarketingComments as comentarios_marketing,
        si.InternalComments as comentarios_internos,
        si.SearchDetails as palabras_claves,
        sih.QuantityOnHand as cantidad_disponible,
        si.Barcode as ubicacion
    FROM Warehouse.StockItems si
    LEFT JOIN Purchasing.Suppliers s ON si.SupplierID = s.SupplierID
    LEFT JOIN Warehouse.PackageTypes pt ON si.UnitPackageID = pt.PackageTypeID
    LEFT JOIN Warehouse.PackageTypes pt2 ON si.OuterPackageID = pt2.PackageTypeID
    LEFT JOIN Warehouse.StockItemHoldings sih ON si.StockItemID = sih.StockItemID
    LEFT JOIN Warehouse.Colors c ON si.ColorID = c.ColorID
    WHERE si.StockItemID = @StockItemID;
END
GO

CREATE OR ALTER PROCEDURE sp_CreateProducto
    @StockItemName NVARCHAR(100),
    @SupplierID INT,
    @ColorID INT = NULL,
    @UnitPackageID INT,
    @OuterPackageID INT,
    @QuantityPerOuter INT,
    @Brand NVARCHAR(50) = NULL,
    @Size NVARCHAR(20) = NULL,
    @TaxRate DECIMAL(18,3),
    @UnitPrice DECIMAL(18,2),
    @RecommendedRetailPrice DECIMAL(18,2) = NULL,
    @LeadTimeDays INT,
    @Barcode NVARCHAR(50) = NULL,
    @IsChillerStock BIT = 0,
    @TypicalWeightPerUnit DECIMAL(18,3) = NULL,
    @MarketingComments NVARCHAR(MAX) = NULL,
    @InternalComments NVARCHAR(MAX) = NULL
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO Warehouse.StockItems (
            StockItemName, SupplierID, ColorID, UnitPackageID, OuterPackageID,
            QuantityPerOuter, Brand, Size, TaxRate, UnitPrice, 
            RecommendedRetailPrice, LeadTimeDays, Barcode,
            IsChillerStock, TypicalWeightPerUnit, 
            MarketingComments, InternalComments,
            LastEditedBy
        )
        VALUES (
            @StockItemName, @SupplierID, @ColorID, @UnitPackageID, @OuterPackageID,
            @QuantityPerOuter, @Brand, @Size, @TaxRate, @UnitPrice,
            @RecommendedRetailPrice, @LeadTimeDays, @Barcode,
            @IsChillerStock, @TypicalWeightPerUnit,
            @MarketingComments, @InternalComments,
            1  -- Usuario por defecto
        );

        -- Insertar en StockItemHoldings con cantidad inicial 0
        DECLARE @NewStockItemID INT = SCOPE_IDENTITY();
        
        INSERT INTO Warehouse.StockItemHoldings (
            StockItemID, QuantityOnHand, BinLocation, LastStocktakeQuantity,
            LastCostPrice, ReorderLevel, TargetStockLevel
        )
        VALUES (
            @NewStockItemID, 0, @Barcode, 0, @UnitPrice, 0, 0
        );

        COMMIT TRANSACTION;
        
        SELECT @NewStockItemID AS NewStockItemID;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_UpdateProducto
    @StockItemID INT,
    @StockItemName NVARCHAR(100) = NULL,
    @SupplierID INT = NULL,
    @ColorID INT = NULL,
    @UnitPackageID INT = NULL,
    @OuterPackageID INT = NULL,
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
    @InternalComments NVARCHAR(MAX) = NULL
AS
BEGIN
    UPDATE Warehouse.StockItems
    SET 
        StockItemName = ISNULL(@StockItemName, StockItemName),
        SupplierID = ISNULL(@SupplierID, SupplierID),
        ColorID = ISNULL(@ColorID, ColorID),
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
        InternalComments = ISNULL(@InternalComments, InternalComments)
    WHERE StockItemID = @StockItemID;

    -- Si se actualiza el barcode, también actualizar en StockItemHoldings
    IF @Barcode IS NOT NULL
    BEGIN
        UPDATE Warehouse.StockItemHoldings
        SET BinLocation = @Barcode
        WHERE StockItemID = @StockItemID;
    END

    SELECT @@ROWCOUNT AS FilasAfectadas;
END
GO

CREATE PROCEDURE sp_DeleteProducto
    @StockItemID INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar si existen órdenes de venta relacionadas
        IF EXISTS (SELECT 1 FROM Sales.OrderLines WHERE StockItemID = @StockItemID)
        BEGIN
            RAISERROR('No se puede eliminar el producto porque tiene órdenes de venta relacionadas.', 16, 1);
            RETURN;
        END

        -- Verificar si existen órdenes de compra relacionadas
        IF EXISTS (SELECT 1 FROM Purchasing.PurchaseOrderLines WHERE StockItemID = @StockItemID)
        BEGIN
            RAISERROR('No se puede eliminar el producto porque tiene órdenes de compra relacionadas.', 16, 1);
            RETURN;
        END

        -- Eliminar de StockItemHoldings primero
        DELETE FROM Warehouse.StockItemHoldings 
        WHERE StockItemID = @StockItemID;

        -- Eliminar de StockItems
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

CREATE PROCEDURE sp_GetVentas
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @FiltroCliente NVARCHAR(100) = NULL,
    @FechaInicio DATE = NULL,
    @FechaFin DATE = NULL,
    @MetodoEntrega NVARCHAR(100) = NULL,
    @MontoMin DECIMAL(18,2) = NULL,
    @MontoMax DECIMAL(18,2) = NULL
AS
BEGIN
    WITH FacturasFiltradas AS (
        SELECT 
            i.InvoiceID,
            i.InvoiceDate,
            c.CustomerName,
            dm.DeliveryMethodName
        FROM Sales.Invoices i
        INNER JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
        INNER JOIN Application.DeliveryMethods dm ON i.DeliveryMethodID = dm.DeliveryMethodID
        WHERE (@FiltroCliente IS NULL OR c.CustomerName LIKE '%' + @FiltroCliente + '%')
        AND (@FechaInicio IS NULL OR i.InvoiceDate >= @FechaInicio)
        AND (@FechaFin IS NULL OR i.InvoiceDate <= @FechaFin)
        AND (@MetodoEntrega IS NULL OR dm.DeliveryMethodName = @MetodoEntrega)
    ),
    VentasConMonto AS (
        SELECT 
            ff.InvoiceID,
            ff.InvoiceDate,
            ff.CustomerName,
            ff.DeliveryMethodName,
            (SELECT SUM(il.Quantity * il.UnitPrice) 
             FROM Sales.InvoiceLines il 
             WHERE il.InvoiceID = ff.InvoiceID) as MontoTotal
        FROM FacturasFiltradas ff
    )
    SELECT 
        InvoiceID as id,
        InvoiceDate as fecha,
        CustomerName as cliente,
        DeliveryMethodName as metodo_entrega,
        MontoTotal as monto
    FROM VentasConMonto
    WHERE (@MontoMin IS NULL OR MontoTotal >= @MontoMin)
    AND (@MontoMax IS NULL OR MontoTotal <= @MontoMax)
    ORDER BY InvoiceDate DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

CREATE PROCEDURE sp_GetTotalVentas
    @FiltroCliente NVARCHAR(100) = NULL,
    @FechaInicio DATE = NULL,
    @FechaFin DATE = NULL,
    @MetodoEntrega NVARCHAR(100) = NULL,
    @MontoMin DECIMAL(18,2) = NULL,
    @MontoMax DECIMAL(18,2) = NULL
AS
BEGIN
    WITH FacturasFiltradas AS (
        SELECT 
            i.InvoiceID
        FROM Sales.Invoices i
        INNER JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
        INNER JOIN Application.DeliveryMethods dm ON i.DeliveryMethodID = dm.DeliveryMethodID
        WHERE (@FiltroCliente IS NULL OR c.CustomerName LIKE '%' + @FiltroCliente + '%')
        AND (@FechaInicio IS NULL OR i.InvoiceDate >= @FechaInicio)
        AND (@FechaFin IS NULL OR i.InvoiceDate <= @FechaFin)
        AND (@MetodoEntrega IS NULL OR dm.DeliveryMethodName = @MetodoEntrega)
    ),
    VentasConMonto AS (
        SELECT 
            ff.InvoiceID,
            (SELECT SUM(il.Quantity * il.UnitPrice) 
             FROM Sales.InvoiceLines il 
             WHERE il.InvoiceID = ff.InvoiceID) as MontoTotal
        FROM FacturasFiltradas ff
    )
    SELECT COUNT(*) as Total
    FROM VentasConMonto
    WHERE (@MontoMin IS NULL OR MontoTotal >= @MontoMin)
    AND (@MontoMax IS NULL OR MontoTotal <= @MontoMax);
END
GO

CREATE PROCEDURE sp_GetVentaDetalles
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

-- Verificar que los procedimientos se crearon correctamente
SELECT name, type_desc, create_date 
FROM sys.procedures 
WHERE name LIKE 'sp_%'
ORDER BY name;
GO