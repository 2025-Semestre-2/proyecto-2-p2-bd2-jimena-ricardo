const sql = require('mssql');

const connectionString = 'Server=LAPTOP-NHTRS4E4\\MYSQLSERVER;Database=WideWorldImporters;User Id=sa;Password=raspberry;Encrypt=false;TrustServerCertificate=true';

const poolPromise = sql.connect(connectionString)
  .then(pool => {
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
    process.exit(1);
  });

module.exports = {
  sql, poolPromise
};