const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// POST - Login
router.post('/login', async (req, res) => {
    try {
        const { nombre, password } = req.body;
        
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Nombre:', nombre);
        
        const usuario = await Usuario.findOne({ nombre });
        
        if (!usuario) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        
        if (usuario.password !== password) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
        
        console.log('Login exitoso:', usuario.nombre);
        res.json({
            id: usuario._id,
            nombre: usuario.nombre
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// POST - Crear usuarios iniciales (solo para setup)
router.post('/seed', async (req, res) => {
    try {
        const usuarios = req.body;
        
        // Limpiar usuarios existentes
        await Usuario.deleteMany({});
        console.log('Usuarios anteriores eliminados');
        
        // Crear nuevos usuarios
        const usuariosCreados = await Usuario.insertMany(usuarios);
        console.log(`${usuariosCreados.length} usuarios creados`);
        
        res.json({ 
            message: 'Usuarios creados exitosamente',
            count: usuariosCreados.length
        });
    } catch (error) {
        console.error('Error al crear usuarios:', error);
        res.status(500).json({ message: 'Error al crear usuarios', error: error.message });
    }
});

module.exports = router;
