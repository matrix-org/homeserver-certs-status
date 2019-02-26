const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
        console.log("DB", 'Connected to the database.');
    }
  });

var allRows = [];
var currentIndex = 0;

var sqlAllRows = "SELECT * FROM homeservers WHERE lasttested IS NOT NULL ORDER BY lastparsed"
db.all(sqlAllRows,  (err, rows) => {
    if (err) {
        console.log(err);
        return;
    }
    allRows = rows;
    setInterval(parseNext, 10);
});

function parseNext() {
    if (currentIndex >= allRows.length) return;
    var row = allRows[currentIndex]
    var lastjson = row.lastjson;
    var gotJsonResponse = false;
    var wellKnownOk = false;
    var connectionReports = 0;
    var allCertsValid = false;
    try {
        lastjson = JSON.parse(lastjson);
        gotJsonResponse = true;
    } catch {
        gotJsonResponse = false;
    }

    if (gotJsonResponse) {
        wellKnownOk = ! lastjson.WellKnownResult.error;
        connectionReports = Object.keys(lastjson.ConnectionReports);
        if (connectionReports.length > 0) allCertsValid = true;
        connectionReports.forEach(ip => {
            if (! lastjson.ConnectionReports[ip].ValidCertificates) {
                allCertsValid = false;
            }
        });
    }

    var sql = `UPDATE homeservers SET
        gotJsonResponse = ${gotJsonResponse},
        wellKnownOk = ${wellKnownOk},
        connectionReports = ${connectionReports ? connectionReports.length : 0},
        allCertsValid = ${allCertsValid},
        lastparsed =  '${(new Date()).toISOString()}'
        WHERE  hostname = "${row.hostname}"`;
    console.log(sql);
    db.run(sql, (res, err) => {
        if (res) console.log(res);
        if (err) {
            console.log(err);
        }
    });

    currentIndex++;
}
