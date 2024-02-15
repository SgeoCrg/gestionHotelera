const mongoose = require('mongoose');

let incidenciaSchema = new mongoose.Schema({
    descripcion: {
        //type: Text,
        type: String,
        required: [true, 'La descripción de la incidencia es obligatoria'],
    },
    fechaInicio: {
        type: Date,
        default: Date.now,
        required: [true, 'La fecha inicial de la incidencia es obligatoria'],
    },
    fechaFin: {
        type: Date
    },
    imagen: {
        type: String,
        required: false
    }
});

let habitacionSchema = new mongoose.Schema({
    numero: {
        type: Number,
        min:[1, 'El número de habitación debe ser como mínimo 1 cambiado'],
        max: [100, 'El número de habitacion debe ser como máximo el 100 cambiado'],
        required: [true, 'El número de habitación es obligatorio cambiado']
    },
    tipo: {
        type: String,
        enum: ['INDIVIDUAL', 'DOBLE', 'FAMILIAR', 'SUITE'],
        default: 'INDIVIDUAL',
    },
    descripcion: {
        //type: Text,
        type: String,
        required: [true, 'La descripcion de la habitación es oblgatoria'],
    },
    ultimaLimpieza: {
        type: Date,
        default: Date.now,
        required: [true, 'La fecha de la última limpieza es obligatoria'],
    },
    precio: {
        type: Number,
        min: [0, 'La habitación, como mínimo, puede ser gratis'],
        max: [250, 'El precio de la habitación no puede exceder los 250 euros cambiado'],
        required: [true, 'El precio de la habitación es obligatorio'],
    },
    imagen: {
        type: String,
        required: false
    },
    incidencias: [incidenciaSchema]
            //type: mongoose.Schema.Types.ObjectId,
            //ref: "incidencias"
    //]
});


let Habitacion = mongoose.model('habitacion', habitacionSchema);
//let Incidencia = mongoose.model('incidencias', incidenciaSchema);

module.exports = Habitacion;