const moongose = require('mongoose');

let usuarioSchema = new moongose.Schema({
    login: {
    type: String,
    minLength: 4,
    required: true
    },
    password: {
        type: String,
        minLength: 7,
        required: true
    }
});

let Usuario = new moongose.model('usuario', usuarioSchema);

module.exports = Usuario;