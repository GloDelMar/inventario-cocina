const mongoose = require('mongoose');

const recetaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        default: ''
    },
    porciones: {
        type: Number,
        required: true,
        min: 1
    },
    ingredientes: [{
        ingredienteId: {
            type: String,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 0
        },
        cantidadUsada: {
            type: Number,
            required: true,
            min: 0
        },
        unidad: {
            type: String,
            required: true
        },
        costoPorUnidad: {
            type: Number,
            required: true,
            min: 0
        },
        costoTotal: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    costoEmpaquetado: {
        type: Number,
        default: 0,
        min: 0
    },
    costoIngredientes: {
        type: Number,
        required: true,
        min: 0
    },
    costoTotal: {
        type: Number,
        required: true,
        min: 0
    },
    costoPorPorcion: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Receta', recetaSchema);
