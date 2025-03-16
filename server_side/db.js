
const mysql = require('mysql2');

port = 3307;
const db =  mysql.createConnection({
    user:'root',
    host:'localhost',
    port: port,
    password: 'strong_password',
    database: 'db',
    connectTimeout: 5000 // 10 seconds
});

db.connect((err)=> {
    if(err){
        console.log(err);
    }
    else{
        console.log("Connected!!")
    }
})

module.exports = db;