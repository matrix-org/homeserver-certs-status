#!/usr/bin/env node

process.chdir(__dirname);
const { exec } = require('child_process');const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
        console.log("DB", 'Connected to the database.');
    }
  });

var userlist = [];

exec(`remote.sh`, {maxBuffer: 20000000}, (err, stdout, stderr) => {
    userlist = stdout.split("\n");
    userlist.splice(0, 2);
    userlist.splice(userlist.length - 3, 3);
    var servers = userlist.map(user => {return user.split(":")[1].trim()});
    servers = new Set(servers);
    servers = Array.from(servers);
    insertHomeservers(servers);
});

function insertHomeservers(homeservers) {
    homeservers.forEach(hostname => {
        hostname = hostname.trim();
        var usercount = userlist.filter(user => user.indexOf(hostname) !== -1).length;

        db.serialize(function() {
            var sql = `UPDATE homeservers SET usercount = ${usercount} WHERE hostname = "${hostname}"`;
            console.log(sql);
            db.run(sql, (res, err) => {
                if (err) {
                    console.log(err);
                }
            });

            var sqlInsert = `INSERT INTO homeservers (hostname, usercount) VALUES ("${hostname}", ${usercount})`;
            console.log(sqlInsert);
            db.run(sqlInsert, (res, err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
}