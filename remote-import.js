const { exec } = require('child_process');const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
        console.log("DB", 'Connected to the database.');
    }
  });

exec(`remote.sh`, {maxBuffer: 20000000}, (err, stdout, stderr) => {
    var size = stdout.length;
    var array = stdout.split("\n");
    array.splice(0, 2);
    array.splice(array.length - 3, 3);
    array = array.map(user => {return user.split(":")[1].trim()});
    var set = new Set(array);
    array = Array.from(set);
    insertHomeservers(array);
});

function insertHomeservers(homeservers) {
    homeservers.forEach(hostname => {
        var sql = `INSERT INTO homeservers (hostname) VALUES ("${hostname.trim()}")`;
        console.log(sql);
        db.run(sql, (res, err) => {
            if (res) console.log(res);
            if (err) console.log(err);
        });
    });
}