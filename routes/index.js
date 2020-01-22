const express = require('express')
const router = express.Router()

// Express manda el hola mundo a la solicitud get del servidor
router.get('/', (req, res) => {
    res.render('index');
})

// Exporta el router para poder usarlo donde sea
module.exports = router