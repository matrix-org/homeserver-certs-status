#!/usr/bin/env node

process.chdir(__dirname);
const { exec } = require('child_process');const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
    }
  });

var userlist = [];

exec(`./remote.sh`, {maxBuffer: 20000000}, (err, stdout, stderr) => {
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
        // long list of mxid strings which indicate that this might be a
        // bridged user. need to string match because it's not possible
        // to confirm over federation who is bridged (or a bot)
        var usercount = userlist.filter(user => 
            user.indexOf(hostname) !== -1 &&
            user.indexOf("freenode") === -1 &&
            user.indexOf("discord") === -1 &&
            user.indexOf("telegram") === -1 &&
            user.indexOf("_gimpnet_") === -1 &&
            user.indexOf("mozilla_") === -1 &&
            user.indexOf("_rizon_") === -1 &&
            user.indexOf("torn_") === -1 &&
            user.indexOf("wammux_") === -1 &&
            user.indexOf("_xmpp_") === -1 &&
            user.indexOf("_twitter_") === -1 &&
            user.indexOf("gitter_") === -1 &&
            user.indexOf("_espernet_") === -1 &&
            user.indexOf("_neb_rssbot_") === -1 &&
            user.indexOf("slack_") === -1 &&
            user.indexOf("_oftc_") === -1 &&
            user.indexOf("w3c_") === -1 &&
            user.indexOf("_foonetic_") === -1 &&
            user.indexOf("_rocketchat_") === -1 &&
            user.indexOf("_snoonet_") === -1
            ).length;

        db.serialize(function() {
            var sql = `UPDATE homeservers SET usercount = ${usercount} WHERE hostname = "${hostname}"`;
            db.run(sql, (res, err) => {
                if (err) {
                    console.log(err);
                }
            });

            var sqlInsert = `INSERT INTO homeservers (hostname, usercount) VALUES ("${hostname}", ${usercount})`;
            db.run(sqlInsert, (res, err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
}