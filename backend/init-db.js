const mongoose = require('mongoose');
require('dotenv').config();

const Usuario = require('./models/Usuario');
const Ingrediente = require('./models/Ingrediente');
const Receta = require('./models/Receta');

const usuarios = require('../usuarios.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario-cocina';

async function inicializarDB() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        
        // Limpiar toda la base de datos
        console.log('\n🧹 Limpiando base de datos...');
        await Ingrediente.deleteMany({});
        console.log('  ✅ Ingredientes eliminados');
        
        await Receta.deleteMany({});
        console.log('  ✅ Recetas eliminadas');
        
        await Usuario.deleteMany({});
        console.log('  ✅ Usuarios eliminados');
        
        // Crear nuevos usuarios
        console.log('\n👥 Creando usuarios...');
        const usuariosCreados = await Usuario.insertMany(usuarios);
        console.log(`  ✅ ${usuariosCreados.length} usuarios creados:`);
        usuariosCreados.forEach(u => console.log(`     - ${u.nombre}`));
        
        console.log('\n✨ Base de datos inicializada correctamente!');
        console.log('\n📋 Credenciales de acceso:');
        usuarios.forEach(u => {
            console.log(`   ${u.nombre}: ${u.password}`);
        });
        
        await mongoose.connection.close();
        console.log('\n👋 Conexión cerrada');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

inicializarDB();
