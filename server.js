'use strict';
const db = require('./db.js');
const express = require('express');
const bodyParser = require('body-parser');
const PORT = 8080;
const HOST = '0.0.0.0';
const TIMEOUT = 1500;
const app = express();

const config = {
    region: process.env.REGION,
    username: process.env.DATABASE_USER,
    hostname: process.env.DATABASE_HOST,
    port: 3306,
    database: 'workloads_test',
    ssl: 'Amazon RDS'
}

// Make this environment based to connect to DB for local dev
db.getConnection(config).then(con => {
    con.connect(err => {
        if (err) throw err;
        console.log("Connected!");
    });

    global.db = con;
});


app.get('/', function (req, res, next) {
    res.json({
        'msg': 'Test with no namespace'
    })
});

app.get('/db', function (req, res, next) {
    res.json({
        'msg': 'Hello from DB API'
    })
});

app.get('/db/pets', function (req, res, next) {
    let query = "SELECT * FROM pet";

    global.db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        }
        res.json(result);
    })
});

app.listen(PORT, HOST);
console.log('Listening on http://%s:%d', HOST || '*', PORT);
module.exports = app;
