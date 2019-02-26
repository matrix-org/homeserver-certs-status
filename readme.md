# homeserver-status

From a list of visible homeservers, and a list of phone-home servers, hit them each with the federation tester, then parse the result.

There are separate scripts for each step:

1. `import.js` reads `data/visible-hs.txt` and expects to see one hostname per line, no other information. These are assumed to be homeservers visible from matrix.org.
2. `update-phone-home.js` reads `data/phone-home-hs.txt` and expects to see one hostname per line, no other information. These are assumed to be homeservers which phone home, and will overlap with visible homeservers.
3. `test-homeservers.js` looks at each hostname in turn, and tests each one against `https://matrix.org/federationtester/api/report`. It writes the response to the db. *It does not parse the response.*  This script sorts by `lasttested`, so that if interrupted you can just run it again.
4. `parse.js` takes each response per homeserver and parses it, storing the results in the db.