module.exports = function(numero) {
    let tipo;
    switch(numero) {
        case '0':
            tipo =  "INDIVIDUAL";
            break;
        case '1':
            tipo =  "DOBLE";
            break;
        case '2':
            tipo = "FAMILIAR";
            break;
        case '3':
            tipo = "SUITE";
            break;
        default:
            break;
    }
    return tipo;
}