var Marketext = require('./Marketext');

var marketext = new Marketext();

//Definir ID empresa
marketext.company_id = "eurolatin"; //Company ID

//Definir Usuario
marketext.user = "Murano"; //User ID

//Definir Contraseña
marketext.password = "tabako1"; //Password

marketext.submit_sms("573205555555","Mensaje de prueba").then(result => {
    //envio exitoso
    console.log(result);

}, error => {

    //se ha producido un error
    console.error(error);
});