const moment = require('moment');

module.exports = function(fecha) {
        return moment(fecha).format('YYYY/MM/DD');
}