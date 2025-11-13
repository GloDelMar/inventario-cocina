const express = require('express');
const router = express.Router();
const Receta = require('../models/Receta');
const Ingrediente = require('../models/Ingrediente');

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
        const { nombre, descripcion, porciones, ingredientes, costoEmpaquetado } = req.body;
        
        // Enriquecer ingredientes con datos de la base de datos
        const ingredientesEnriquecidos = await Promise.all(
            ingredientes.map(async (ing) => {
                const ingredienteDB = await Ingrediente.findById(ing.ingredienteId);
                if (!ingredienteDB) {
                    throw new Error(`Ingrediente ${ing.nombre} no encontrado`);
                }
                
                return {
                    ingredienteId: ing.ingredienteId,
                    nombre: ingredienteDB.nombre,
                    cantidad: ingredienteDB.cantidad,
                    unidad: ingredienteDB.unidad,
                    costoTotal: ingredienteDB.costoTotal,
                    costoPorUnidad: ingredienteDB.costoPorUnidad,
                    cantidadUsada: ing.cantidadUsada
                };
            })
        );
        
        // Calcular costos
        const costoIngredientes = ingredientesEnriquecidos.reduce((sum, ing) => {
            return sum + (ing.costoPorUnidad * ing.cantidadUsada);
        }, 0);
        
        const costoTotal = costoIngredientes + (costoEmpaquetado || 0);
        const costoPorPorcion = costoTotal / porciones;
        
        const nuevaReceta = new Receta({
            nombre,
            descripcion,
            porciones,
            ingredientes: ingredientesEnriquecidos,
            costoEmpaquetado: costoEmpaquetado || 0,
            costoIngredientes,
            costoTotal,
            costoPorPorcion
        });
        
        const recetaGuardada = await nuevaReceta.save();
        res.status(201).json(recetaGuardada);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear receta', error: error.message });
    }
});

// PUT - Actualizar una receta
router.put('/:id', async (req, res) => {
    try {
        const { nombre, descripcion, porciones, ingredientes, costoEmpaquetado } = req.body;
        
        // Enriquecer ingredientes con datos de la base de datos
        const ingredientesEnriquecidos = await Promise.all(
            ingredientes.map(async (ing) => {
                const ingredienteDB = await Ingrediente.findById(ing.ingredienteId);
                if (!ingredienteDB) {
                    throw new Error(`Ingrediente ${ing.nombre} no encontrado`);
                }
                
                return {
                    ingredienteId: ing.ingredienteId,
                    nombre: ingredienteDB.nombre,
                    cantidad: ingredienteDB.cantidad,
                    unidad: ingredienteDB.unidad,
                    costoTotal: ingredienteDB.costoTotal,
                    costoPorUnidad: ingredienteDB.costoPorUnidad,
                    cantidadUsada: ing.cantidadUsada
                };
            })
        );
        
        // Calcular costos
        const costoIngredientes = ingredientesEnriquecidos.reduce((sum, ing) => {
            return sum + (ing.costoPorUnidad * ing.cantidadUsada);
        }, 0);
        
        const costoTotal = costoIngredientes + (costoEmpaquetado || 0);
        const costoPorPorcion = costoTotal / porciones;
        
        const recetaActualizada = await Receta.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                descripcion,
                porciones,
                ingredientes: ingredientesEnriquecidos,
                costoEmpaquetado: costoEmpaquetado || 0,
                costoIngredientes,
                costoTotal,
                costoPorPorcion
            },
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
