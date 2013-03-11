##Grand Master CAS
Grand Master CAS is a lightweight, easy library for [CAS authentication](http://www.jasig.org/cas/protocol)

Right now, parts of Grand Master CAS depends on [express](http://expressjs.com/), but hopefully soon it will play nicely with any node program.

####Installation
    npm install grand_master_cas

####There are only three steps needed to get it going
######1. require it
    var cas = require('grand_master_cas'); // cas is an object here, not a constructor
                                           // because I return new GrandMasterCas in the module.
######2. configure it
    cas.configure({
      casHost: "secure.its.yale.edu",   // required
      casPath: "/cas",                  // your cas login route (defaults to "/cas")
      ssl: true,                        // is the cas url https? defaults to false
      port: 443,                        // defaults to 80 if ssl false, 443 if ssl true
      service: "http://localhost:3000", // your site
      sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
      renew: false,                     // true or false, false is the default
      gateway: false,                   // true or false, false is the default
      redirectUrl: '/splash'            // the route that cas.blocker will send to if not authed. Defaults to '/'
    });
######3. throw it in your routes
     app.get('/splash', routes.splash);
     // grand_master_cas provides a logout
     app.get('/logout', cas.logout);
     // cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
     app.get('/login', cas.bouncer, routes.login);
     // cas.blocker redirects to the redirectUrl supplied above if not logged in.
     app.get('/', cas.blocker, routes.index);

For an example express app which uses Yale University's CAS login, check out /examples/yale_cas_express.
    `npm install`
    `node server`
Open your browser to localhost:3000 and you'll see a prompt to log in via Yale CAS. If you have a net id, you should be able to explore full functionality.

*Once the user is logged in, Grand Master CAS sets req.session.cas_user (or your sessionName configuration option) equal to the user's username supplied by cas.*

####Tests
Grand Master CAS is pretty well tested.
In the root dir, run `npm test` or `make test` to run all tests.
Run `make coverage` to run the coverage tests. or just open coverage.html from the git repo in your browser to see the results of the latest coverage test.

Grand Master CAS is written by [Zack Reneau-Wedeen](http://zackrw.com)
