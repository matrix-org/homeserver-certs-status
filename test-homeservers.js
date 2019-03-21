#!/usr/bin/env node

process.chdir(__dirname);
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const db = new sqlite3.Database('./visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
    }
  });

var allRows = [];
var currentIndex = 0;

var sqlAllRows = "SELECT * FROM homeservers ORDER BY lasttested"
db.all(sqlAllRows,  (err, rows) => {
    if (err) {
        console.log(err);
        return;
    }
    allRows = rows;
    setInterval(testNext, 2000);
});

function testNext() {
    if (! allRows[currentIndex]) return;
    var hostname = allRows[currentIndex].hostname;
    testHostname(hostname);
    currentIndex++;
}
  
function testHostname(hostname) {
    var url = `https://matrix.org/federationtester/api/report?server_name=${hostname}`;
    https.get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            updateRawJson(hostname, data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function updateRawJson(hostname, json) {
    var sql = `UPDATE homeservers
        SET lastjson = '${json.replace(/\'/g, "''")}', lasttested =  '${(new Date()).toISOString()}'
        WHERE  hostname = "${hostname}"`;
    db.run(sql, (res, err) => {
        if (res) console.log(res);
        if (err) {
            console.log(err);
        }
    });
}