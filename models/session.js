const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    sessid: {
        type: String,
        required: true
    },
    containerid: {
        type: String,
        required: true
    },
    lastinteraction: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Author', authorSchema)