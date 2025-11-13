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
    console.log('=== POST /api/recetas ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { nombre, descripcion, porciones, ingredientes, costoEmpaquetado } = req.body;
        
        console.log('Validando datos recibidos...');
        console.log('- Nombre:', nombre);
        console.log('- Descripción:', descripcion);
        console.log('- Porciones:', porciones);
        console.log('- Ingredientes:', ingredientes ? ingredientes.length : 0);
        console.log('- Costo empaquetado:', costoEmpaquetado);
        
        if (!ingredientes || ingredientes.length === 0) {
            console.error('Error: No hay ingredientes');
            return res.status(400).json({ message: 'Debe incluir al menos un ingrediente' });
        }
        
        // Enriquecer ingredientes con datos de la base de datos
        console.log('Enriqueciendo ingredientes desde DB...');
        const ingredientesEnriquecidos = await Promise.all(
            ingredientes.map(async (ing, index) => {
                console.log(`  [${index}] Buscando ingrediente ID: ${ing.ingredienteId}`);
                const ingredienteDB = await Ingrediente.findById(ing.ingredienteId);
                if (!ingredienteDB) {
                    console.error(`  [${index}] ERROR: Ingrediente no encontrado`);
                    throw new Error(`Ingrediente con ID ${ing.ingredienteId} no encontrado`);
                }
                
                console.log(`  [${index}] Encontrado: ${ingredienteDB.nombre}, costo: ${ingredienteDB.costoPorUnidad}/unidad`);
                
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
        
        console.log('Ingredientes enriquecidos:', ingredientesEnriquecidos.length);
        
        // Calcular costos
        console.log('Calculando costos...');
        const costoIngredientes = ingredientesEnriquecidos.reduce((sum, ing) => {
            const costo = ing.costoPorUnidad * ing.cantidadUsada;
            console.log(`  ${ing.nombre}: ${ing.cantidadUsada} × ${ing.costoPorUnidad} = ${costo}`);
            return sum + costo;
        }, 0);
        
        const costoTotal = costoIngredientes + (costoEmpaquetado || 0);
        const costoPorPorcion = costoTotal / porciones;
        
        console.log('Costos calculados:');
        console.log('  Costo ingredientes:', costoIngredientes);
        console.log('  Costo empaquetado:', costoEmpaquetado || 0);
        console.log('  Costo total:', costoTotal);
        console.log('  Costo por porción:', costoPorPorcion);
        
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
        
        console.log('Guardando receta en DB...');
        const recetaGuardada = await nuevaReceta.save();
        console.log('Receta guardada exitosamente, ID:', recetaGuardada._id);
        
        res.status(201).json(recetaGuardada);
    } catch (error) {
        console.error('Error al crear receta:', error.message);
        console.error('Stack:', error.stack);
        res.status(400).json({ message: 'Error al crear receta', error: error.message });
    }
});

// PUT - Actualizar una receta
router.put('/:id', async (req, res) => {
    console.log('=== PUT /api/recetas/:id ===');
    console.log('Recipe ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { nombre, descripcion, porciones, ingredientes, costoEmpaquetado } = req.body;
        
        console.log('Validando datos recibidos...');
        console.log('- Nombre:', nombre);
        console.log('- Descripción:', descripcion);
        console.log('- Porciones:', porciones);
        console.log('- Ingredientes:', ingredientes ? ingredientes.length : 0);
        console.log('- Costo empaquetado:', costoEmpaquetado);
        
        // Enriquecer ingredientes con datos de la base de datos
        console.log('Enriqueciendo ingredientes desde DB...');
        const ingredientesEnriquecidos = await Promise.all(
            ingredientes.map(async (ing, index) => {
                console.log(`  [${index}] Buscando ingrediente ID: ${ing.ingredienteId}`);
                const ingredienteDB = await Ingrediente.findById(ing.ingredienteId);
                if (!ingredienteDB) {
                    console.error(`  [${index}] ERROR: Ingrediente no encontrado`);
                    throw new Error(`Ingrediente con ID ${ing.ingredienteId} no encontrado`);
                }
                
                console.log(`  [${index}] Encontrado: ${ingredienteDB.nombre}, costo: ${ingredienteDB.costoPorUnidad}/unidad`);
                
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
        console.log('Calculando costos...');
        const costoIngredientes = ingredientesEnriquecidos.reduce((sum, ing) => {
            const costo = ing.costoPorUnidad * ing.cantidadUsada;
            console.log(`  ${ing.nombre}: ${ing.cantidadUsada} × ${ing.costoPorUnidad} = ${costo}`);
            return sum + costo;
        }, 0);
        
        const costoTotal = costoIngredientes + (costoEmpaquetado || 0);
        const costoPorPorcion = costoTotal / porciones;
        
        console.log('Costos calculados:');
        console.log('  Costo ingredientes:', costoIngredientes);
        console.log('  Costo empaquetado:', costoEmpaquetado || 0);
        console.log('  Costo total:', costoTotal);
        console.log('  Costo por porción:', costoPorPorcion);
        
        console.log('Actualizando receta en DB...');
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
            console.error('Receta no encontrada con ID:', req.params.id);
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        
        console.log('Receta actualizada exitosamente');
        res.json(recetaActualizada);
    } catch (error) {
        console.error('Error al actualizar receta:', error.message);
        console.error('Stack:', error.stack);
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
