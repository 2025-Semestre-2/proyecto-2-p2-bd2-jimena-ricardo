-- En WWISJ
USE WWISJ
GO
CREATE TABLE [User] (
    iduser INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    fullname NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'corporativo')),
    active BIT DEFAULT 1,
    hiredate DATE NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    Branch NVARCHAR(3) NOT NULL DEFAULT 'SJ'
);
GO

-- En WWILM
USE WWILM
GO
CREATE TABLE [User] (
    iduser INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    fullname NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'corporativo')),
    active BIT DEFAULT 1,
    hiredate DATE NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    Branch NVARCHAR(3) NOT NULL DEFAULT 'LM'
);
GO

-- En WWICorp
USE WWICorp
GO
CREATE TABLE [User] (
    iduser INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    fullname NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    rol NVARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'corporativo')),
    active BIT DEFAULT 1,
    hiredate DATE NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    Branch NVARCHAR(3) NOT NULL DEFAULT 'COR'
);
GO

CREATE OR ALTER PROCEDURE sp_CreateUser
    @username NVARCHAR(50),
    @password NVARCHAR(255),
    @fullname NVARCHAR(100),
    @email NVARCHAR(100),
    @rol NVARCHAR(20),
    @hiredate DATE,
    @active BIT = 1
AS
BEGIN
    DECLARE @hashedPassword NVARCHAR(64);
    
    -- Encriptar y convertir a string hexadecimal
    SET @hashedPassword = LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', @password), 2));
    
    INSERT INTO [User] (
        username, password, fullname, email, rol, hiredate, active
    )
    VALUES (
        @username, @hashedPassword, @fullname, @email, @rol, @hiredate, @active
    );

    SELECT SCOPE_IDENTITY() AS NewUserID;
END
GO

EXEC sp_CreateUser 
    @username = 'admin.sj',
    @password = 'password123',
    @fullname = 'Admin San José',
    @email = 'admin.sj@empresa.com',
    @rol = 'admin',
    @hiredate = '2024-01-15',
    @active = 1;

EXEC sp_CreateUser 
    @username = 'admin.lm',
    @password = 'password123',
    @fullname = 'Admin Limón',
    @email = 'admin.lm@empresa.com',
    @rol = 'admin',
    @hiredate = '2024-01-15',
    @active = 1;

EXEC sp_CreateUser 
    @username = 'corporativo',
    @password = 'password123',
    @fullname = 'Usuario Corporativo',
    @email = 'corporativo@empresa.com',
    @rol = 'corporativo',
    @hiredate = '2024-01-15',
    @active = 1;
GO

CREATE OR ALTER PROCEDURE sp_ValidateUserCredentials
    @username NVARCHAR(50),
    @password NVARCHAR(255)
AS
BEGIN
    DECLARE @hashedPassword NVARCHAR(64);
    SET @hashedPassword = LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', @password), 2));
    
    SELECT 
        iduser,
        username,
        fullname,
        email,
        rol,
        active,
        hiredate
    FROM [User]
    WHERE username = @username 
      AND password = @hashedPassword
      AND active = 1;
END
GO