const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    fecnac: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Author', authorSchema)