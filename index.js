/*
Aplicación estructurada en carpetas para una API REST completa sobre
Habitaciones y Limpiezas
*/

// Librerias
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const methodOverride = require('method-override');
const dateFilter = require('nunjucks-date-filter');

// Enrutadores
const habitaciones = require(__dirname + '/routes/habitaciones');
const limpiezas = require(__dirname + '/routes/limpiezas');
const auth = require(__dirname + '/routes/auth');

// Conexión con la BD
//mongoose.connect('mongodb://127.0.0.1:27017/hotel');
mongoose.connect('mongodb+srv://sgeocrg:admin@cluster0.ciyowro.mongodb.net/?retryWrites=true&w=majority');

//servidor Express
let app = express();

//Configuramos motor nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

function setUpNunjucks(expressApp) {

    let env = nunjucks.configure('views', {
        autoescape: true,
        express: app
    });

    env.addFilter('date', dateFilter);
}

setUpNunjucks();


//Asignación del motor de plantillas
app.set('view engine', 'njk');

// Middleware para peticiones POST y PUT
// Middleware para estilos bootstrap
// Enrutadores para cada grupo de rutas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(methodOverride(function(req, res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: false
}));
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})
app.use('/habitaciones', habitaciones);
app.use('/limpiezas', limpiezas);
app.use('/auth', auth);

app.use('/public', express.static(__dirname + '/public'));


// Puesta en marcha del servidor
//app.listen(8080);
app.listen(5500, () => {
    console.log("Escuchando...");
});//ojo al puerto si cambia en VsCode

app.get('/', (req, res) => {
    res.redirect('/auth/login');///public/index.js
});
