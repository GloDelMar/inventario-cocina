const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
    usuarioId: {
        type: String,
        required: true,
        index: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0
    },
    unidad: {
        type: String,
        required: true,
        enum: ['kg', 'g', 'l', 'ml', 'unidad', 'pza']
    },
    costoTotal: {
        type: Number,
        required: true,
        min: 0
    },
    costoPorUnidad: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ingrediente', ingredienteSchema);
