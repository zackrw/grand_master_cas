##Grand Master CAS
Grand Master CAS is a lightweight, easy library for [CAS authentication](http://www.jasig.org/cas/protocol)

Grand Master CAS is extremely easy to use in an [express](http://expressjs.com/) app, but also plays very nicely with any node program.

####There are only three steps needed to get it going
######1. require it
    var cas = require('grand_master_cas');
######2. configure it
    cas.configure({
      casHost: "secure.its.yale.edu",   // required
      ssl: true,                        // is the cas url https? defaults to false
      port: 443,                        // defaults to 80 if ssl false, 443 if ssl true
      service: "http://localhost:3000", // your site
      sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
      renew: false,                     // true or false, false is the default
      gateway: false,                   // true or false, false is the default
      redirectUrl: '/splash'            // the route that cas.redirecter will send to if not authed. Defaults to '/'
    });
######3. throw it in your routes
     app.get('/splash', routes.splash);
     // grand_master_cas provides a logout
     app.get('/logout', cas.logout);
     // cas.bouncer prompts for authentication and performs login if not logged in. If logged in it passes on.
     app.get('/login', cas.bouncer, routes.login);
     // cas.redirecter redirects to the redirectUrl supplied above if not logged in.
     app.get('/', cas.redirecter, routes.index);

For an example express app which uses Yale University's CAS login, check out /examples/yale_cas_express

*Once the user is logged in, Grand Master CAS sets req.session.cas_user (or your sessionName configuration option) equal to the user's username supplied by cas.*

###Without express
Without express, it's pretty much the same, just without the convenience of express routing.
######1. require it
    var cas = require('grand_master_cas');
######2. configure it
    cas.configure({
      casHost: "secure.its.yale.edu",   // required
      ssl: true,                        // is the cas url https? defaults to false
      port: 443,                        // defaults to 80 if ssl false, 443 if ssl true
      service: "http://localhost:3000", // your site
      sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
      renew: false,                     // true or false, false is the default
      gateway: false,                   // true or false, false is the default
      redirectUrl: '/splash'            // the route that cas.redirecter will send to if not authed. Defaults to '/'
    });
######3. throw it in your server logic

    http.createServer(function(req, res){
      cas.bouncer(req, res, function(){
        // code for when the user gets past the bouncer
      });
    });

Grand Master CAS is written by [Zack Reneau-Wedeen](http://zackrw.com)
