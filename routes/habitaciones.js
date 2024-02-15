const express = require('express');
const seleccionar_tipo = require('../utils/seleccionar_tipo.js');
const formatear_fecha = require('../utils/formatear_fecha.js')
const { body } = require('express-validator');
const multer = require('multer');
const moment = require('moment');
const autentication = require('../utils/autentication.js');

let Habitacion = require(__dirname + '/../models/habitacion.js');
const Limpieza = require('../models/limpieza');
let router = express.Router();

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/habitaciones_del_proyecto');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
})

let incidencia_storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/incidencias');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
})

let upload = multer({storage: storage});

let uploadIncidencia = multer({storage: incidencia_storage});

//Actualizar el estado de una incidencia de una habitación PUT'/habitaciones/:idH/incidencias/:idI'
router.put('/:idH/incidencias/:idI', autentication.autenticacion,  (req, res) => {
    let bool = false;
    Habitacion.findById(req.params.idH).then(resultadoH => {
        let arrayIncidencias = resultadoH.incidencias;
        arrayIncidencias.forEach(element => {
            if (element.id === req.params.idI) {
                element.fechaFin = Date.now();
                bool = true;
            }
        })
        if (bool) {
            resultadoH.save().then(resultado => {
                res.redirect('/habitaciones/'+req.params.idH);
                //res.status(200).send({ ok: router, resultado: resultadoH });
            })
        } else {
            res.redirect('error', { error: 'Error cerrando incidencia' })
            //res.status(400).send({ ok: false, error: "Incidencia no encontrada" });
        }
    });
});


//Servicio listado general GET'/habitaciones' NO PEDIDO SOLO USO COMPROBACIÓN
router.get('/', (req, res) => {
    Habitacion.find().sort({ numero: 1 }).then(resultado => {
        res.render('habitaciones_listado', { habitaciones: resultado });
    }).catch(error => {
        res.render('error', { error: 'Error listando habitaciones' })
    });
});

//Ruta para ir al formulario de inserción GET'/habitaciones/nueva'
router.get('/nueva', autentication.autenticacion, (req, res) => {
    res.render('habitacion_nueva');
});

router.get('/limpiezas/:id', (req, res) => {
    res.redirect(req.baseUrl + '/limpiezas/' + req.params['id']);
});

router.get('/auth', (req, res) => {
    res.redirect(req.baseUrl + '/auth/login');
});

//Ruta para ir al formulario de edicion GET'/habitaciones/editar/id'

router.get('/editar/:id', autentication.autenticacion, (req, res) => {
    Habitacion.findById(req.params['id']).then(resultado => {
        console.log(req.params['id']);
        if(resultado) {
            const fechaLimpieza = resultado.ultimaLimpieza.toISOString().split('T')[0];
            console.log(fechaLimpieza);
            res.render('habitacion_editar', { habitacion: resultado, fechaLimpieza: fechaLimpieza });
        } else {
            res.render('error', { error: "2-Habitacion no encontrada"});
        }
    }).catch(error => {
        res.render('error', {error: "1-Habitación no encontrada"});
    });
});

//Servicio detalles habitacion por id GET'/habitaciones/id'
router.get('/:id', (req, res) => {
    Habitacion.findById(req.params.id).then(resultado => {
        if (resultado) {
            console.log(resultado.incidencias);
            console.log(resultado.imagen);
            res.render('habitacion_ficha', { habitacion: resultado });
        } else
            res.render('error', { error: 'Habitación no encontrada' });
    }).catch(error => {
        res.render('error', { error: 'Error buscando habitación' });
    });
})

//Insertar habitacion POST'/habitaciones'
router.post('/', upload.single('imagen'), autentication.autenticacion, (req, res) => {
    let tipo = seleccionar_tipo(req.body.tipo);
    let fecha;
    let imagen = null;
    if(req.file != undefined)
        imagen = req.file.filename
    if(req.body.fecha !== '') {
        console.log('if',req.body.fecha);
        fecha = formatear_fecha(req.body.fecha);
    } else {
        fecha = moment(Date.now()).format('YYYY/MM/DD');
        console.log('else',Date.now());
    }
    console.log('post:',tipo);
    console.log('post:',fecha);
    let nuevaHabitacion = new Habitacion({
        numero: req.body.numero,
        tipo: tipo,
        descripcion: req.body.descripcion,
        ultimaLimpieza: fecha,
        precio: req.body.precio,
        imagen: imagen //req.file.filename//usar req.file.filename???
    });
    console.log(fecha);

    nuevaHabitacion.save().then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        let errores = Object.keys(error.errors);
        //let mensaje = "";
        if(errores.length > 0) {
            errores = Object.keys(error.errors).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});
            /*errores.forEach(clave => {
                mensaje += '<p>' + error.errors[clave].message + '</p>';
            });*/
        } else {
            mensaje = 'Error añadiendo habitación';
            res.render('error', { error: mensaje });
        }
        console.log(errores);
        res.render('habitacion_nueva', {errores: errores});
        //res.render('error', { error: mensaje });
    });
});

//Eliminar habitación DELETE'/habitaciones/:id'
router.delete('/:id', autentication.autenticacion, (req, res) => {
    Limpieza.find({ "idHabitacion": req.params.id }).then(
        async resultado => {
            if(resultado) {
                console.log('resultado:',resultado);
                resultado.forEach(element => {
                    console.log('element:',element.id);
                    Limpieza.findByIdAndDelete(element.id).then(
                        console.log('borrado ', element.id)
                    );
                });
            }
        }
    );

    Habitacion.findByIdAndDelete(req.params.id).then(resultado => {
        res.redirect(req.baseUrl);
        /*if (resultado)
            res.status(200).send({ ok: true, resultado: resultado });
        else
            res.status(400).send({ ok: false, error: "Error eliminando la Habitación" });*/
    }).catch(error => {
        res.render('error', { error: "Error borrando habitación"});
        //res.status(500).send({ ok: false, error: "Error eliminando la Habitación" });
    });
});

//Actualizar datos habitacion PUT'/habitaciones/:id'

router.put('/:id', (req, res) => {
    console.log(req.body.tipo);
    let tipo = seleccionar_tipo(req.body.tipo);
    let fecha = formatear_fecha(req.body.fecha);
    console.log(tipo);
    Habitacion.findByIdAndUpdate(req.params.id, {
        $set: {
            numero: req.body.numero,
            tipo: tipo,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            ultimaLimpieza: fecha
        }
    }, {new: true}).then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        res.render('error', { error: "Error modificando habitación"});
    });
});

/*router.put('/:id', (req, res) => {
    if (req.params.id.toLowerCase() == 'ultimalimpieza') {
        Habitacion.find().then(resultadoH => {
            resultadoH.forEach(element => {

                Limpieza.find({ "idHabitacion": element.id }).then(resultadoL => {
                    if (resultadoL) {
                        resultadoL.sort((a, b) => b.fechaHora - a.fechaHora);
                        let fechaLimpieza = resultadoL[0].fechaHora;
                        if (Habitacion.findById(element.id)) {
                            Habitacion.findByIdAndUpdate(element.id, {
                                $set: {
                                    ultimaLimpieza: fechaLimpieza
                                }
                            }, { new: true }).then(resultadoFinal => {
                                if (resultadoFinal)
                                    res.status(200).send({ ok: true, resultado: resultadoFinal });
                                else
                                    res.status(500).send({ ok: false, error: "Base de  datos no encontrada" });
                            })
                        }
                    }
                }).catch(error => {
                    res.status(400).send({ ok: false, error: "Habitación sin limpiezas" });
                });
            });

            //res.status(200).send({ ok: true, resultado: resultadoH });
        }).catch(error => {
            res.status(500).send({ ok: false, error: "No hay habitaciones registradas en la aplicación" });
        });
    } else {
        Habitacion.findByIdAndUpdate(req.params.id, {
            $set: {
                tipo: req.body.tipo,
                descripcion: req.body.descripcion,
                ultimaLimpieza: req.body.ultimaLimpieza,
                precio: req.body.precio
            }
        }, { new: true }).then(resultado => {
            if (resultado)
                res.status(200).send({ ok: true, resultado: resultado });
            else
                res.status(400).send({ ok: false, error: "Error actualizando los datos de la habitación" });
        }).catch(error => {
            res.status(500).send({ ok: false, error: "Error actualizando los datos de la habitación" });
        });
    }
});*/

//Añadir incidencia a una habitacion POST'habitaciones/:idH/incidencias'
router.post('/:id/incidencias', uploadIncidencia.single('imagen'), (req, res) => {
    //console.log(req.params);
    //console.log(req.body);
    let imagen = null;
    if(req.file != undefined)
        imagen = req.file.filename
    Habitacion.findById(req.params.id).then(resultado => {
        let descripcion = req.body.descripcion
        resultado.incidencias.push({ 
            descripcion: req.body.descripcion,
            imagen: imagen });

        resultado.save().then(resultadoFinal => {
            res.redirect('/habitaciones/' + req.params.id);
            //res.status(200).send({ ok: true, resultado: resultadoFinal });
        }).catch(error => {
            res.redirect('error', { error: 'Error guardadndo incidencia'});
            //res.status(400).send({ ok: false, error: "Error insertando la Habitacion" });
        });
    });
});

//Actualizar última limpieza PUT'habitaciones/:id/ultimalimpieza'
router.put('/:id/ultimalimpieza', (req, res) => {
    Limpieza.find({ "idHabitacion": req.params.id }).then(resultado => {
        if (resultado) {
            resultado.sort((a, b) => b.fechaHora - a.fechaHora);
            let fechaLimpieza = resultado[0].fechaHora;
            Habitacion.findByIdAndUpdate(req.params.id, {
                $set: {
                    ultimaLimpieza: fechaLimpieza
                }
            }, { new: true }).then(resultadoFinal => {
                if (resultadoFinal)
                    res.status(200).send({ ok: true, resultado: resultadoFinal });
                else
                    res.status(500).send({ ok: false, error: "Base de  datos no encontrada" });
            })
        }
    }).catch(error => {
        res.status(400).send({ ok: false, error: "Habitación sin limpiezas" });
    });
});

//Actualizar todas las limpiezas PUT'/habitaciones/ultimaLimpieza'

module.exports = router;