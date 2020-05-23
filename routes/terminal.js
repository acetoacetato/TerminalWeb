const express = require('express')
const router = express.Router()
const Terminal = require('../models/terminal')
const crypto = require('crypto')
const cookieParser = require('cookie-parser')

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
        res.render('terminal/index', {
            authors: autores,
            searchOptions: req.query
        })
    }catch{
        res.render('terminal/index');
    }
    

})

// Función que inicializa un container,
//  retornando el id del contenedor generado
async function runContainer() {
    // Ejecuta el comando que recibe
    function execCommand(cmd){
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if(error){
                    console.error(error)
                }
                resolve(stdout? stdout:stderr);
            });
        });
    }
    var id = await execCommand('docker run -t -d ubuntu');
    console.log( "casi al retornar", id)
    return id;

}

// Ruta para preparar el entorno.
//  Si la persona tiene una cookie se revisan los datos asociados
//      o crea una instancia completamente nueva.
router.post('/cookie', async (req, res) => {
    var cookie = req.cookies.sessid;

    // Si no tiene cookies, se le crea una instancia y se guarda en la db
    if(cookie === undefined){
        var randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        var containerId = -1;
        //Se crea una id de la sesión y se guarda en las cookies
        res.cookie('sessid',randomNumber, { maxAge: 2 * 60 * 60 * 1000, httpOnly: true });
        
        // Se crea la instancia docker
        var containerId = await runContainer();

        // Se crea la instancia del terminal de la base de datos
        const terminal = new Terminal({
            sessid : randomNumber,
            containerid: containerId
        });


        try {
            // Se guarda la sesión en la base de datos
            const newTerminal = await terminal.save()
            // Se manda un resultado satisfactorio
            res.send({'result': 'success', 'message': 'creado nuevo terminal'});
            return;
        }catch {
            // Se manda el error para que la vista lo maneje
            res.send({'result': 'error', 'message': 'no se pudo guardar el terminal'});
            return;
        }
    } else{
        // Se busca el terminal asociado a la cookie
        const terminales = await Terminal.find({ 'sessid': cookie });
        console.log(terminales.length);

        // Si no existe la cookie, entonces se le crea una nueva sesión
        if(terminales.length < 1){
            console.log('no hay sesiones con esa cookie');

            // Se crea el contenedor
            var dockerId = await runContainer();
            // Se crea la instancia de la sesión de la db
            var terminal = new Terminal({'sessid' : req.cookies.sessid, 'containerid': dockerId});
            try {
                // Se guarda la sesión en la db
                const newTerminal = await terminal.save()
                res.send({'result': 'success', 'message': 'creado nuevo terminal'});
            }catch (e){
                console.error(e)
                res.send({'result': 'error', 'message': 'no se pudo guardar el terminal'});
            }
            return
        }
        // Si hay un terminal asociado, 
        //  se obtienen los 12 primeros caracteres del id del contenedor
        //      para así buscarlo
        var dockerId = terminales[0].containerid.substring(0, 12);  

        // Se comprueba que el contenedor está disponible y corriendo
        exec('docker ps | grep ' + dockerId + ' | wc -l', async function(err, stdout, stderr) {

            // Si falla el obtener el docker por alguna razón, se intenta crear otro
            //  FIXME: arreglar eso
            if(err){
                console.log('falló al obtener el docker');
                var dockerId = await runContainer();
                var terminal = new Terminal({'sessid' : req.cookies.sessid, 'containerid': dockerId});
                await Terminal.save();
                res.send({'result': 'succes', 'message': 'generado automaticamente'});
                return;
            }
            // Si no está el docker disponible, se le crea uno
            if (stdout < 1){
                exec('docker run -t -d ubuntu', async function(err, stdout, stderr) {
                    console.log('no encuentra docker')
                    if(err){
                        res.render('terminal', {'success' : false});
                        console.log('falló al obtener el docker');
                        return;
                    }
                    dockerId = stdout;
                    // Se le actualiza la referencia al docker en la base de datos
                    await Terminal.findOneAndUpdate({'sessid' : cookie}, {'containerid' : dockerId}, options={'new' : false});

                });
            }
        });

        res.send({'result': 'success', 'message': 'se carga un terminal existente'});
        return;
        console.log('cookie n ' + cookie);
        
    }
    res.render('terminal/index')
})


//Ruta para mandar los comandos al terminal
//TODO: arreglar lo que hace cuando hay errores.
router.post('/terminal', async (req, res) => {
    var comando = req.body.comando;
    console.log(req.body.comando);
    var cookie = req.cookies.sessid;
    if(!cookie){
        res.send({"result": "error", "message": "no se ha iniciado una sesión, contacte con el administrador."});
        return;
    }

    const terminales = await Terminal.find({ 'sessid': cookie });
    console.log(terminales.length);
    if(terminales.length != 1){
        res.send({"result": "error", "message": "no hay una sesión creada, contacte con el administrador."});
        return;
    }

    var dockerId = terminales[0].containerid.substring(0, 12);  
    var path = terminales[0].path;
    // Se comprueba que hay un docker iniciado y disponible
    exec('docker ps | grep ' + dockerId + ' | wc -l', async function(err, stdout, stderr) {
        if(err){
            res.send({'result': 'error', 'message': 'el contenedor no está arriba, contacte administrador'});
            return;
        }

        

        // Ejecuta el comando que recibe
        //    docker exec -i cf bash  -c 'cd home && ls'
        //docker exec -i cf53cfad70fe bash -c 'cd ..'
        exec(`docker exec -i  ${ dockerId } bash -c 'cd ${ path } && ${ comando } && echo "" && echo $PWD'`, async function(err, stdout, stderr) {
            console.log(`docker exec -i  ${ dockerId } bash -c 'cd ${ path } && ${ comando } && echo "" && echo $PWD'`);
            console.log(stdout);
            console.log(stderr);
            stdout = stdout.trim();
            salida = stdout.substring(0, stdout.lastIndexOf("\n"))
            lines = stdout.split("\n");
            path = lines[lines.length -1];
            console.log('path = ' + path);

            if(terminales[0].path != path){
                await Terminal.findOneAndUpdate({'sessid' : cookie}, {'path': path }, options={'new' : false});
            }
            if(err){
                res.send({'result' : 'success', 'message': stderr});
                return;
            }
                
            res.send({'result': 'success', 'message': salida, 'route': (path + '> ')});
            return;
            
        });

        
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