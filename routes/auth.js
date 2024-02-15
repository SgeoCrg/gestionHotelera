const express = require('express');
let Usuario = require(__dirname + '/../models/usuario.js');
let router = express.Router();

//Ruta para ir al formulario de LOGIN GET'/login'
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

router.post('/login', async (req, res) => {
    let login = req.body.login;
    let password = req.body.password;
    let usuarios = await Usuario.find().then(resultado => {
        return resultado;
    });

    let existeUsuario = usuarios.filter(usuario => {
        return usuario.login === login && usuario.password === password
    });

    console.log(existeUsuario);

    if(existeUsuario.length > 0) {
        console.log('*',existeUsuario);
        console.log("usuario existe: ", existeUsuario[0]);
        req.session.usuario = existeUsuario[0].login;
        console.log(req.session.usuario);
        //res.render('habitaciones_listado');
        res.redirect('/habitaciones');
    } else {
        console.log('en el else');
        res.render('login', { error: 'usuario o contraseña incorrectos'});
    }

    /*Usuario.find().then(resultado => {
        let usuarios;
        let existeUsuario;
        if(resultado) {
            existeUsuario = resultado.filter(usuario => {
                console.log('usuario:', usuario + '-' + login + '-' + password);
                console.log(usuario.login);
                return usuario.login === login && usuario.password === password}
            );
            console.log(existeUsuario);
            console.log(existeUsuario.length);
            if(existeUsuario.length > 0) {
                console.log('*',existeUsuario);
                console.log("usuario existe: ", existeUsuario[0].usuario);
                req.session.usuario = existeUsuario[0].usuario;
                console.log(req.session.usuario);
                //res.render('habitaciones_listado');
                res.redirect('/habitaciones');
            } else {
                console.log('en el else');
                res.render('login', { error: 'usuario o contraseña incorrectos'});
            }
        }
    });*/

});

module.exports = router;