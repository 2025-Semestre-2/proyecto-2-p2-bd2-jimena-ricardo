const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/inventarios', require('./routes/inventarios'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/estadisticas', require('./routes/estadisticas'));
app.use('/api/filtros', require('./routes/filtros'));

app.get('/api/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Dirección requerida' });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WideWorldImporters/1.0 (jimendez@example.com)',
          'Accept-Language': 'es'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return res.json({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name
        });
      }
    }
    
    res.status(404).json({ error: 'No se encontraron resultados para la dirección' });
  } catch (error) {
    console.error('Error en geocodificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Servidor API en puerto ${PORT}`);
});