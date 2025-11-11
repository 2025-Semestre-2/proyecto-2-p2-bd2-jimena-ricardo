const sql = require('mssql');

const dbConfig ={
   server: 'localhost',
   authentication: {
    type: 'default',
     options: {
       userName: 'sa',
       password: 'Romanos5:8',
     },
   },
   options: {
     port: 1439,
     database: 'WideWorldImporters',
     encrypt: false,
   },
 };

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
    process.exit(1);
  });

module.exports = {
  sql, poolPromise
};