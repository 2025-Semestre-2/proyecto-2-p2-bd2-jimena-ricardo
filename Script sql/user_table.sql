--USE WWICorp
--USE WWISJ
--USE WWILM
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
    fecha_creacion DATETIME DEFAULT GETDATE()
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
    INSERT INTO [User] (
        username, password, fullname, email, rol, hiredate, active
    )
    VALUES (
        @username, @password, @fullname, @email, @rol, @hiredate, @active
    );

    SELECT SCOPE_IDENTITY() AS NewUserID;
END
GO

--En los siguientes inserts para todas las contraseñas son password

INSERT INTO [User] (username, password, fullname, email, rol, hiredate, active) VALUES 
('juan', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Juan Pérez González', 'juan.perez@empresa.com', 'admin', '2024-01-15', 1),
('maria', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'María García López', 'maria.garcia@empresa.com', 'admin', '2024-02-20', 1),
('carlos', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Carlos Rodríguez Méndez', 'carlos.rodriguez@empresa.com', 'admin', '2024-03-10', 1),
('ana', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Ana Martínez Solís', 'ana.martinez@empresa.com', 'admin', '2024-04-05', 1),
('pedro', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Pedro Sánchez Ruiz', 'pedro.sanchez@empresa.com', 'admin', '2024-05-12', 1);


INSERT INTO [User] (username, password, fullname, email, rol, hiredate, active) VALUES 
('corp.ventas', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Laura Díaz Castro', 'laura.diaz@empresa.com', 'corporativo', '2024-01-10', 1),
('corp.rrhh', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Miguel Ángel Torres', 'miguel.torres@empresa.com', 'corporativo', '2024-02-15', 1),
('corp.finanzas', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Sofía Hernández Mora', 'sofia.hernandez@empresa.com', 'corporativo', '2024-03-22', 1),
('corp.marketing', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Roberto Jiménez Paz', 'roberto.jimenez@empresa.com', 'corporativo', '2024-04-18', 1),
('corp.operaciones', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Elena Ramírez Soto', 'elena.ramirez@empresa.com', 'corporativo', '2024-05-30', 1);
