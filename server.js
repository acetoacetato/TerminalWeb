if(process.env.NODE_ENV !== 'production'){
    dotenv = require('dotenv').config({path:__dirname + '/.env'})
}

// Express para manejar las rutas de la aplicación
const express = require('express')
const app = express()



//Express layouts para usar trozos de html que vayan en cada pagina necesaria
const expressLayouts = require('express-ejs-layouts')

const bodyParser = require('body-parser')
const cors = require('cors')
/**
 *      Ruteadores
 */

app.use(cors());
// El routeador principal, que maneja las rutas del index
const indexRouter = require('./routes/index.js')

// El routeador que maneja las rutas de los autores
const authorRouter = require('./routes/authors.js')
const libroRouter = require('./routes/libros.js')
const terminalRouter = require('./routes/terminal.js')
const cookieParser = require('cookie-parser')

/**
 *      Base de datos
 */

const mongoose = require('mongoose')

//Se setean las cosas como carpeta de vistas (MVC) y los layouts
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(cookieParser());


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//La carpeta accesible por todo el front
app.use(express.static('public'))

//El parseador de los parametros que se pasan a las rutas
app.use(bodyParser.urlencoded({limit: '10mb', extended : false}))
app.use(bodyParser.json())
mongoose.connect(process.env.DATABASE_URL, { 
    useNewUrlParser : true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection
db.on('error', err => console.error(err))
db.once('open', () => console.log('conectado a mongoose'))


// Se agrega el indexRouter para manejar el index
app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/libros', libroRouter)
app.use('/terminal', terminalRouter)


//Se abre el servidor en el puerto que salga o en el 9000 si es devStart
app.listen(process.env.PORT || 9000)


