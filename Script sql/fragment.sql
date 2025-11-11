RESTORE DATABASE WWICorp
FROM DISK = '/var/opt/mssql/backup/WideWorldImporters-Full.bak'
WITH
    MOVE 'WWI_Primary' TO '/var/opt/mssql/data/WWICorp.mdf',
    MOVE 'WWI_UserData' TO '/var/opt/mssql/data/WWICorp_UserData.ndf',
    MOVE 'WWI_Log' TO '/var/opt/mssql/data/WWICorp.ldf',
    MOVE 'WWI_InMemory_Data_1' TO '/var/opt/mssql/data/WWICorp_InMemory_Data_1',
STATS = 5;
GO

CREATE DATABASE WWISJ
GO
CREATE DATABASE WWILM
GO
-- After that, execute wwi_structure.sql in both DDBBs.

-- ============================== FRAGMENTATION ==============================

-- ============================== Application scheme ==============================

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

-- Countries: 

-- Cities: 

-- StateProvinces: 

BEGIN TRANSACTION
--COMMIT TRANSACTION
ROLLBACK TRANSACTION











