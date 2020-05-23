const mongoose = require('mongoose')

const terminalSchema = new mongoose.Schema({
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
    },
    path: {
        type: String,
        default: '/'
    }
})

module.exports = mongoose.model('Terminal', terminalSchema)