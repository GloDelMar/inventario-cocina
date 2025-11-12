const express = require('express');
const router = express.Router();
const Ingrediente = require('../models/Ingrediente');

// GET - Obtener todos los ingredientes
router.get('/', async (req, res) => {
    try {
        const ingredientes = await Ingrediente.find().sort({ createdAt: -1 });
        res.json(ingredientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ingredientes', error: error.message });
    }
});

// GET - Obtener un ingrediente por ID
router.get('/:id', async (req, res) => {
    try {
        const ingrediente = await Ingrediente.findById(req.params.id);
        if (!ingrediente) {
            return res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
        res.json(ingrediente);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ingrediente', error: error.message });
    }
});

// POST - Crear un nuevo ingrediente
router.post('/', async (req, res) => {
    try {
        const { nombre, cantidad, unidad, costoTotal } = req.body;
        
        // Calcular costo por unidad
        const costoPorUnidad = costoTotal / cantidad;
        
        const nuevoIngrediente = new Ingrediente({
            nombre,
            cantidad,
            unidad,
            costoTotal,
            costoPorUnidad
        });
        
        const ingredienteGuardado = await nuevoIngrediente.save();
        res.status(201).json(ingredienteGuardado);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear ingrediente', error: error.message });
    }
});

// PUT - Actualizar un ingrediente
router.put('/:id', async (req, res) => {
    try {
        const { nombre, cantidad, unidad, costoTotal } = req.body;
        
        // Calcular costo por unidad
        const costoPorUnidad = costoTotal / cantidad;
        
        const ingredienteActualizado = await Ingrediente.findByIdAndUpdate(
            req.params.id,
            { nombre, cantidad, unidad, costoTotal, costoPorUnidad },
            { new: true, runValidators: true }
        );
        
        if (!ingredienteActualizado) {
            return res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
        
        res.json(ingredienteActualizado);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar ingrediente', error: error.message });
    }
});

// DELETE - Eliminar un ingrediente
router.delete('/:id', async (req, res) => {
    try {
        const ingredienteEliminado = await Ingrediente.findByIdAndDelete(req.params.id);
        
        if (!ingredienteEliminado) {
            return res.status(404).json({ message: 'Ingrediente no encontrado' });
        }
        
        res.json({ message: 'Ingrediente eliminado correctamente', ingrediente: ingredienteEliminado });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar ingrediente', error: error.message });
    }
});

module.exports = router;
