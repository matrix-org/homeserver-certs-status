# homeserver-status

From a list of visible homeservers, and a list of phone-home servers, hit them each with the federation tester, then parse the result.

There are separate scripts for each step:

1. `homeservers.sql` is used to create a new SQLite DB called `visible.db` with a single table.
2. `remote-import.js` connects to juventas and inserts all visible homeservers from 2019-01-01.
3. `test-homeservers.js` looks at each hostname in turn, and tests each one against `https://matrix.org/federationtester/api/report`. It writes the response to the db. *It does not parse the response.*  This script sorts by `lasttested`, so that if interrupted you can just run it again.
4. `parse.js` takes each response per homeserver and parses it, storing the results in the db.
5. `output-html.js` takes two arguments, a template file and an output file. It will generate a single page to be deployed.