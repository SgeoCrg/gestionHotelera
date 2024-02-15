const express = require('express');
const buscarIdHabitacion = require('../utils/buscarIdHabitacion');
let Habitacion = require(__dirname + '/../models/habitacion.js');
let Limpieza = require(__dirname + '/../models/limpieza.js');
let router = express.Router();

//Servicio de listado de todas las limpiezas
router.get('/', (req, res) => {
    Limpieza.find().then( resultado => {
        if(resultado)
            res.status(200).send({ok: true, resultado: resultado});
        else
            res.status(500).send({ok: false, error: "No se ha encontrado la base de datos"});
    })
})

//Servicio GET para renderizar el formulario de nueva limpieza
router.get('/nueva/:id', async (req, res, next) => {
    try {
        let numero;
        await Habitacion.findById(req.params.id).then(resultado => {
            if (resultado) numero = resultado.numero;
        })
        const habitacionId = req.params.id;
        const fechaActual = new Date().toISOString().split('T')[0];
        console.log(fechaActual);
        res.render('limpiezas_nueva', { 
            idHabitacion: habitacionId, 
            fechaActual: fechaActual,
        numero: numero });
    } catch(error) {
        next(error);
    }
})

//Servicio de listado limpiezas de una habitación GET'/limpiezas/:id'
router.get('/:id', (req, res) => {
    console.log("llegué");
    let numero;
    Limpieza.find({"idHabitacion": req.params.id})
    .then(async resultado => {
        if(resultado) {
            console.log(resultado);
            resultado.sort((a,b) => b.fechaHora - a.fechaHora);
            await Habitacion.findById(req.params.id).then(resultado => {
                if(resultado) {
                    console.log('en el if:',resultado.numero);
                    numero = resultado.numero;
                } else {
                    res.render('error', { error: 'Habitación sin limpiezas'});
                }
            });
            console.log('limpiezas:',req.params.id);
            res.render('limpiezas_listado', { limpiezas: resultado, numero: numero, idHabitacion: req.params.id });
        } else
            res.render('error', { error: 'Habitación sin limpiezas'});
        }).catch(error => {
            res.render('error', { error: 'No se ha podido encontrar la limpieza: ' + error});
    });
});

//Estado de la limpieza actual de una habitación GET'limpiezas/:id/estadolimpieza'
router.get('/:id/estadolimpieza', (req,res) => {
    Limpieza.find({"idHabitacion": req.params.id}).then(resultado => {
        if(resultado) {
            resultado.sort((a,b) => b.fechaHora - a.fechaHora);
            let fechaUltimaLimpieza = resultado[0].fechaHora;
            resultado = fechaUltimaLimpieza - Date.now() > 0 ? "Limpia": "Pendiente de limpieza";
            res.status(200).send({ok:true, resultado: resultado});
        } else {
            res.status(500).send({ok: false, error:"Base de datos no encontrada"});
        }
    }).catch(error => {
        res.status(400).send({ok: false, error: "Habitacion sin limpiezas"});
    });
});

//Actualizar limpieza POST'/limpiezas/:id'
router.post('/:id', async (req, res, next) => {
    console.log('en post:',req.params.id);
    try {
        const habitacionId = req.params.id;
        const { fechaHora, observaciones } = req.body;

        const nuevaLimpieza = new Limpieza({
            idHabitacion: habitacionId,
            fechaHora,
            observaciones,
        });

        await nuevaLimpieza.save();

        await Habitacion.findByIdAndUpdate(habitacionId, { 
            $set: {
                ultimaLimpieza: fechaHora 
            }
        });

        res.redirect('/limpiezas/' + habitacionId);
    } catch(error) {
        next(error);
    }
    /*let nuevaLimpieza = new Limpieza({
        idHabitacion: req.params.id,
        fechaHora: req.body.fechaHora,
        observaciones: req.body.observaciones
    });

    nuevaLimpieza.save().then(resultado => {
        res.status(200).send({ok: true, resultado: resultado});
    }).catch(error => {
        res.status(400).send({ok: false, error: "Error añadiendo Limpieza"});
    });*/
});

module.exports = router;