const sql = require('mssql');

// Configuración de conexiones por sucursal
const dbConfigs = {
  'SJ': {
    server: '100.78.216.52',
    database: 'WWISJ',
    user: 'sa',
    password: 'raspberry',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  'LM': {
    server: '100.82.130.27', 
    database: 'WWILM',
    user: 'projectUser',
    password: 'AU',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  'CORP': {
    server: '100.82.130.27',
    database: 'WWICorp', 
    user: 'projectUser',
    password: 'AU',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  }
};

// Pool de conexiones
const pools = {};

// Función para obtener conexión según branch
const getConnection = async (branch) => {
  if (!pools[branch]) {
    try {
      pools[branch] = await new sql.ConnectionPool(dbConfigs[branch]).connect();
      console.log(`Conectado a base de datos: ${branch}`);
    } catch (err) {
      console.error(`Error conectando a ${branch}:`, err);
      throw err;
    }
  }
  return pools[branch];
};

// Middleware para detectar branch según IP
const detectBranch = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  console.log('IP del cliente:', clientIP);
  
  // Asignar branch según IP
  if (clientIP.includes('100.78.216.52')) {
    req.branch = 'SJ';
  } else if (clientIP.includes('100.82.130.27')) {
    req.branch = 'LM'; 
  } else {
    // Por defecto o para desarrollo
    req.branch = 'SJ';
  }
  
  console.log('Branch detectado:', req.branch);
  next();
};

// Middleware para determinar base de datos según rol
const determineDatabase = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (username && password) {
      // Intentar autenticar en todas las bases de datos
      for (const branch of ['SJ', 'LM', 'CORP']) {
        try {
          const pool = await getConnection(branch);
          const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .input('password', sql.NVarChar(255), password)
            .execute('sp_ValidateUserCredentials');
          
          if (result.recordset.length > 0) {
            req.user = result.recordset[0];
            req.user.branch = branch;
            
            // Si es corporativo, usar base corporativa para consultas
            if (req.user.rol === 'corporativo') {
              req.database = 'CORP';
            } else {
              req.database = branch;
            }
            
            console.log(`Usuario autenticado: ${username}, rol: ${req.user.rol}, database: ${req.database}`);
            break;
          }
        } catch (err) {
          console.log(`Usuario no encontrado en ${branch}`);
        }
      }
    } else {
      // Si no hay credenciales, usar branch detectado por IP
      req.database = req.branch;
    }
    
    next();
  } catch (error) {
    console.error('Error en determineDatabase:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  sql,
  getConnection,
  detectBranch,
  determineDatabase
};