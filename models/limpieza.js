const mongoose = require('mongoose');

let limpiezaSchema = new mongoose.Schema({
    //La referencia a la idHabitacion que se ha limpiado. Enlazará con el id de la habitación correspondiente en la colección de habitaciones anteriormente creada.
    idHabitacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'habitaciones'
    },
    fechaHora: {
        type: Date,
        default: Date.now,
        required: true
    },
    observaciones: {
        //type: Text
        type: String
    }
});

let Limpieza = mongoose.model('limpiezas', limpiezaSchema);
module.exports = Limpieza;