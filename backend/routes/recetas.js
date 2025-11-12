const express = require('express');
const router = express.Router();
const Receta = require('../models/Receta');

// GET - Obtener todas las recetas
router.get('/', async (req, res) => {
    try {
        const recetas = await Receta.find().sort({ createdAt: -1 });
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener recetas', error: error.message });
    }
});

// GET - Obtener una receta por ID
router.get('/:id', async (req, res) => {
    try {
        const receta = await Receta.findById(req.params.id);
        if (!receta) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        res.json(receta);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener receta', error: error.message });
    }
});

// POST - Crear una nueva receta
router.post('/', async (req, res) => {
    try {
        const nuevaReceta = new Receta(req.body);
        const recetaGuardada = await nuevaReceta.save();
        res.status(201).json(recetaGuardada);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear receta', error: error.message });
    }
});

// PUT - Actualizar una receta
router.put('/:id', async (req, res) => {
    try {
        const recetaActualizada = await Receta.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!recetaActualizada) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        
        res.json(recetaActualizada);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar receta', error: error.message });
    }
});

// DELETE - Eliminar una receta
router.delete('/:id', async (req, res) => {
    try {
        const recetaEliminada = await Receta.findByIdAndDelete(req.params.id);
        
        if (!recetaEliminada) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        
        res.json({ message: 'Receta eliminada correctamente', receta: recetaEliminada });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar receta', error: error.message });
    }
});

module.exports = router;
