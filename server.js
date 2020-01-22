if(process.env.NODE_ENV !== 'production'){
    dotenv = require('dotenv').config({path:__dirname + '/.env'})
}

// Express para manejar las rutas de la aplicación
const express = require('express')
const app = express()

//Express layouts para usar trozos de html que vayan en cada pagina necesaria
const expressLayouts = require('express-ejs-layouts')

// El routeador principal, que maneja las rutas del index
const indexRouter = require('./routes/index.js')

const mongoose = require('mongoose')

//Se setean las cosas como carpeta de vistas (MVC) y los layouts
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

//La carpeta accesible por todo el front
app.use(express.static('public'))

mongoose.connect(process.env.DATABASE_URL, { 
    useNewUrlParser : true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', err => console.error(err))
db.once('open', () => console.log('conectado a mongoose'))


// Se agrega el indexRouter para manejar el index
app.use('/', indexRouter)


//Se abre el servidor en el puerto que salga o en el 3000 si es devStart
app.listen(process.env.PORT || 3000)


