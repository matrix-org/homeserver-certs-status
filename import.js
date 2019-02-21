const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
        console.log("DB", 'Connected to the database.');
    }
  });

var rawList = fs.readFileSync("data/visible-hs.txt", "utf-8");
var homeservers = Array.from(new Set(rawList.split("\n")));

//console.log(homeservers);

homeservers.forEach(hostname => {
    var sql = `INSERT INTO homeservers (hostname) VALUES ("${hostname.trim()}")`;
    console.log(sql);
    db.run(sql, (res, err) => {
        if (res) console.log(res);
        if (err) console.log(err);
    });
});