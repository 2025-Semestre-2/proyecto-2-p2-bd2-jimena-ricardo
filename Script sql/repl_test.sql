USE WWILM
GO
use master
select * from wwilm.Application.TransactionTypes
select * from wwicorp.Application.TransactionTypes

begin transaction
INSERT INTO WWILM.Application.TransactionTypes (TransactionTypeName, LastEditedBy, ValidFrom, ValidTo)
VALUES ('Customer Contra [test2]', 9, '2025-11-15 00:56:03.8611517', '9999-12-31 23:59:59.9999999')
--rollback transaction
commit transaction

delete from WWILM.Application.TransactionTypes where transactiontypeid = 20