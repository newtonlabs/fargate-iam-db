'use strict';

const mysql = require('mysql2');
const AWS = require('aws-sdk');

function getToken(config) {
    return new Promise(resolve => {
        let signer = new AWS.RDS.Signer(config);

        signer.getAuthToken({}, (err, token) => {
            resolve(token);
        });
    })
}

// TODO: What about local development?
async function getConnection(config) {
    let token = await getToken(config);

    let con = mysql.createConnection({
        host: config.hostname,
        user: config.username,
        password: token,
        database: config.database,
        ssl: config.ssl,

        authSwitchHandler: function ({ pluginName, pluginData }, cb) {
            if (pluginName === 'mysql_clear_password') {
                let buffer = Buffer.from(token);
                cb(null, buffer);
            }
            else {
                const err = new Error(`Unknown AuthSwitchRequest plugin name ${pluginName}`);
                err.fatal = true;
                cb(err);
            }
        }
    });

    return con;
}

module.exports.getConnection = getConnection;
