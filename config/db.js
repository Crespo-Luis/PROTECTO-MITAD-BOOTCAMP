const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bucle_lector'
});

//conexion de prueba para inicarnos que la conexión es correcta
connection.connect((err)=>{
    if(err){
        console.log(err.stack);
    }else{
        console.log("Conexión con bd ok");
    }
})

module.exports = connection;
