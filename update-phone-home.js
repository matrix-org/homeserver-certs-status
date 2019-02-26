const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
        console.log("DB", 'Connected to the database.');
    }
  });

var rawList = fs.readFileSync("data/phone-home-hs.txt", "utf-8");
var homeservers = Array.from(new Set(rawList.split("\n")));
var missingHomeservers = [];

homeservers.forEach(function(hostname) {
    var updateSql = `UPDATE homeservers SET
        phonedHome24Hours = 1
        WHERE hostname = '${hostname.trim()}'`;
    //console.log(updateSql);
    db.run(updateSql, function (err)  {
        if (err) console.log(err);
        if (this.changes === 0) {
            var insertSql = `INSERT INTO homeservers (hostname, phonedHome24Hours)
                VALUES ('${hostname.trim()}', 1)`;
            db.run(insertSql, function (err)  {
                if (err) console.log(err);
            });
        }
    });
});