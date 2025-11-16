USE WWICorp
GO

-- Crear tabla para datos sensibles que NO existen en las sucursales
CREATE TABLE Sales.ClienteDatosSensibles (
    CustomerID INT PRIMARY KEY,
    EmailPersonal NVARCHAR(100),
    TelefonoPersonal NVARCHAR(20),
    DireccionResidencia NVARCHAR(200),
    IdentificacionOficial NVARCHAR(50),
    FechaNacimiento DATE,
    UltimaActualizacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CustomerID) REFERENCES Sales.Customers(CustomerID)
);

INSERT INTO Sales.ClienteDatosSensibles (CustomerID, EmailPersonal, TelefonoPersonal, DireccionResidencia)
VALUES 
(1, 'cliente1@personal.com', '2222-1111', 'Calle 123, San José'),
(2, 'cliente2@personal.com', '2222-2222', 'Avenida 456, Limón'),
(3, 'cliente3@personal.com', '2222-3333', 'Barrio Los Ángeles, Cartago');

