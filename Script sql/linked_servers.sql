-- Run this on LM branch (Ricardo's):

SELECT @@SERVERNAME -- To check.

EXEC sp_addlinkedserver 
    @server = 'j',
    @srvproduct = '',
    @provider = 'SQLNCLI',
    @datasrc = '100.78.216.52,1433';

EXEC sp_addlinkedsrvlogin 
    @rmtsrvname = 'j',
    @useself = 'False',
    @locallogin = NULL,
    @rmtuser = 'projectUser',
    @rmtpassword = 'AU';

SELECT * FROM j.master.sys.databases;  -- Check that Jimena's DDBBs appears.

-- Run this on SJ branch (Jimena's):

SELECT @@SERVERNAME -- To check.

EXEC sp_addlinkedserver 
    @server = 'r',
    @srvproduct = '',
    @provider = 'SQLNCLI',
    @datasrc = '100.82.130.27,1433';

EXEC sp_addlinkedsrvlogin 
    @rmtsrvname = 'r',
    @useself = 'False',
    @locallogin = NULL,
    @rmtuser = 'projectUser',
    @rmtpassword = 'AU';

SELECT * FROM r.master.sys.databases;  -- Check that Ricardo's DDBBs appears.