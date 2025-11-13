require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario-cocina';

// Middlewares - CORS con múltiples orígenes permitidos...
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://panaderiacam15.vercel.app',
    'https://glodelmar.github.io',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Permitir requests sin origin (como Postman o curl)
        if (!origin) return callback(null, true);
        
        // Verificar si el origin está en la lista de permitidos
        if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB exitosamente');
        console.log(`📦 Base de datos: ${mongoose.connection.name}`);
    })
    .catch((error) => {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1);
    });

// Rutas
const ingredientesRoutes = require('./routes/ingredientes');
const recetasRoutes = require('./routes/recetas');

app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/recetas', recetasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🍳 API de Gestión de Cocina',
        version: '1.0.0',
        endpoints: {
            ingredientes: '/api/ingredientes',
            recetas: '/api/recetas'
        }
    });
});

// Ruta para verificar estado de la API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Error interno del servidor', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log('\n📝 Endpoints disponibles:');
    console.log(`   - GET/POST    http://localhost:${PORT}/api/ingredientes`);
    console.log(`   - GET/PUT/DEL http://localhost:${PORT}/api/ingredientes/:id`);
    console.log(`   - GET/POST    http://localhost:${PORT}/api/recetas`);
    console.log(`   - GET/PUT/DEL http://localhost:${PORT}/api/recetas/:id`);
    console.log(`   - Health      http://localhost:${PORT}/api/health\n`);
});

// Manejo de cierre gracioso
process.on('SIGINT', async () => {
    console.log('\n⏹️  Cerrando servidor...');
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada');
    process.exit(0);
});
