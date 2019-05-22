#!/usr/bin/env node

const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
process.chdir(__dirname);

const db = new sqlite3.Database('./visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
    }
});

var totalCount = false;
var validCount = false;

var totalUsers = false;
var validUsers = false;

db.serialize(function() {
    var sqlFullCount = "select count(*) as c from homeservers where connectionReports > 0";
    db.get(sqlFullCount,  (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        totalCount = row.c;
    });

    var sqlValidCount = "select count(*) as v from homeservers where allCertsValid = 1";
    db.get(sqlValidCount,  (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        validCount = row.v;
    });

    var sqlFullUserCount = "select sum(usercount) as c from homeservers where connectionReports > 0";
    db.get(sqlFullUserCount,  (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        valuidUsers = row.c;
    });

    var sqlValidUserCount = "select sum(usercount) as c from homeservers where allCertsValid = 1";
    db.get(sqlFullUserCount,  (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        totalUsers = row.c;
        writeHtml();
    });
});

function writeHtml() {
    var templateLocation = process.argv[2] ? process.argv[2] : "../www/arewereadyyet.com/index-template.html";
    //console.log(`Reading template from ${templateLocation}`);
    var template = fs.readFileSync(templateLocation, 'utf-8');

    var outputLocation = process.argv[3] ? process.argv[3] : "../www/arewereadyyet.com/index.html";
    if (outputLocation.indexOf('.html') === -1) {
        console.log("Output needs to be a .hmtl file");
        process.exit(1);
    }
    //console.log(`Output location: ${outputLocation}`);

    var recordDate = (new Date()).toISOString();
    var percent = (validCount / totalCount).toString();
    var userPercent = (validUsers / totalUsers).toString();

    template = template.replace("%%PERCENT%%", percent);
    template = template.replace("%%USERPERCENT%%", userPercent);
    template = template.replace("%%UPDATED%%", recordDate);
    fs.writeFileSync(outputLocation, template);
    fs.appendFileSync("history.txt", `${recordDate}\t${validCount}\t${totalCount}\t${percent}\t${validUsers}\t${totalUsers}\t${userPercent}\n`);
}
