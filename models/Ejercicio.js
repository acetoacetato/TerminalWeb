const mongoose = require('mongoose');

const EjercicioSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    tipoTarea: {
        type: String,
        default: "auto",
        required: true,
    },
    scriptPreparacion: {
        type: String,
        default: null
    },
    respuesta:{
        type: String,
        required: true
    },
    scriptComprobar:{
        type: String,
        required: true
    },
    pista: [String]
});

module.exports = mongoose.model('Ejercicio', EjercicioSchema)