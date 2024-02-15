const express = require('express');
let Habitacion = require(__dirname + '/../models/habitacion.js');

module.exports = function(idHabitacion) {
    console.log(idHabitacion);
    Habitacion.findById(idHabitacion).then(resultado => {
        if (resultado) {
            return resultado.numero;
            //res.render('habitacion_ficha', { habitacion: resultado });
        } else
            res.render('error', { error: 'Habitación no encontrada' });
    }).catch(error => {
        res.render('error', { error: 'Error buscando habitación' });
    });
}