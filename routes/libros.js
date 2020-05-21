const express = require('express')
const router = express.Router()
const Author = require('../models/libros')

// Express manda el hola mundo a la solicitud get del servidor
router.get('/', async (req, res) => {

    res.send('Todos los libros')
})

// Nuevo libro
router.get('/new', (req, res) => {
    res.send('Nuevo libro')
})

// Crear el Libro
router.post('/', async (req, res) => {
    
    res.send('nuevo libro creado')
})

// Exporta el router para poder usarlo donde sea
module.exports = router