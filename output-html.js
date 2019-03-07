#!/usr/bin/env node

const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

if (process.argv.length < 4) {
    console.log("Script needs template and output locatations.");
    process.exit(1);
}
const db = new sqlite3.Database('./visible.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.log("DB", err.message);
    } else {
        console.log("DB", 'Connected to the database.');
    }
});

var totalCount = false;
var validCount = false;

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
        console.log(totalCount, validCount);
        writeHtml();
    });
});

function writeHtml() {
    var templateLocation = process.argv[2];
    console.log(`Reading template from ${templateLocation}`);
    var template = fs.readFileSync(templateLocation, 'utf-8');

    var outputLocation = process.argv[3];
    if (outputLocation.indexOf('.html') === -1) {
        console.log("Output needs to be a .hmtl file");
        process.exit(1);
    }
    console.log(`Output location: ${outputLocation}`);

    template = template.replace("%%PERCENT%%", (validCount / totalCount).toString());
    template = template.replace("%%UPDATED%%", (new Date()).toISOString());
    fs.writeFileSync(outputLocation, template);
}
