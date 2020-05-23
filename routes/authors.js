const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const crypto = require('crypto')

const sys = require('sys')
const exec = require('child_process').exec;
// Express manda el hola mundo a la solicitud get del servidor
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.nombre != null && req.query.nombre.trim() !== ''){
        searchOptions.nombre = new RegExp(req.query.nombre.trim(), 'i')
    }
    try{
        console.log(searchOptions)
        const autores = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: autores,
            searchOptions: req.query
        })
    }catch{
        res.render('/');
    }
    
})

router.post('/path', async(req, res) => {
    exec('printf "%s" $PWD', function(err, stdout, stderr){
        res.send({'result': 'success', 'message': stdout});
    })
})

//TODO: El proceso de autentificación de las sesiones
router.post('/terminal', async (req, res) => {
    var comando = req.body.comando;
    console.log(req.body.comando);
    var id = crypto.randomBytes(20).toString('hex');

    // Ejecuta el comando que recibe
    exec(comando, function(err, stdout, stderr) {
        if(err){
            res.send({'result' : 'error', 'message': 'Problema interno, contacte al administrador'});
        }
        //console.log(stdout);
        //Para obtener $PWD
        exec('printf "%s" $PWD', function(err1, stdout1, stderr1){
            var route = ''
            if(!err1){
                route = stdout1
            }
            
            res.send({'result': 'success', 'message': stdout, 'route': (route + '> ')});
        })
        
    });
})


// Nuevo autor
router.get('/new', (req, res) => {
    res.render('authors/new', { author : new Author()});
})

// Crear el autor
router.post('/', async (req, res) => {
    const autor = new Author({
        nombre : req.body.nombre,
        fecnac : req.body.fecnac
    })
    try {
        const newAuthor = await autor.save()
        res.redirect('authors')
    }catch {
        res.render('authors/new',{
            author: autor,
            errorMessage: 'No se pudo agregar al nuevo autor :c'
        })
    }
})

// Exporta el router para poder usarlo donde sea
module.exports = router