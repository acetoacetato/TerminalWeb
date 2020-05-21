const mongoose = require('mongoose')

const libroSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    fecPub: {
        type: Date,
        required: true
    },
    descripcion: {
        type : String
    },
    genero: {
        type: String,
        required: true
    },
    paginas: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default : Date.now
    },
    img_url : {
        type : String,
        required : true
    },
    autor : {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})

module.exports = mongoose.model('Book', libroSchema)