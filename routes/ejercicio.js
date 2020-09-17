const express = require('express')
const router = express.Router()
const cookieParser = require('cookie-parser')
const Ejercicio = require('../models/Ejercicio')

const exec = require('child_process').exec;

router.get('/', async (req, res) => {
    try{
        ejercicios = await Ejercicio.find({});
        res.render('ejercicio/index', {
            lista: ejercicios
        });
    } catch(e){
        console.error(e);
        res.render('ejercicio/index', {
            lista: []
        });
    }
    

});

router.post('/new', async(req, res) => {
    const ejercicio = new Ejercicio({
        id: req.body.id,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        tipoTarea: req.body.tipoTarea,
        scriptPreparacion: req.body.scriptPreparacion,
        respuesta: req.body.respuesta,
        scriptComprobar: req.body.scriptComprobar
    });
    try{
        await ejercicio.save();
        res.redirect('/');
    } catch (e){
        console.log(e);
        res.render('ejercicio/new', {
            ejercicio: ejercicio,
            errorMessage: "No se pudo agregar debido a un error inesperado"
        });
    }
})

router.get('/new', (req, res) => {
    res.render('ejercicio/new', {
        ejercicio: new Ejercicio()
    });
})




module.exports  = router;