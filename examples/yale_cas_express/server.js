
/**
 * Module dependencies.
 */

/*
 *  3 STEPS
 *  1. require grand_master_cas
 *  2. configure cas
 *  3. add bouncers and blockers method to protected routes
 *
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , cas = require('../../lib/grand_master_cas');




var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

cas.configure({
  casHost: 'secure.its.yale.edu',
  ssl: true,
  service: 'http://localhost:3000',
  redirectUrl: '/splash'
});


app.get('/splash', routes.splash);
app.get('/logout', cas.logout);

app.get('/login', cas.bouncer, routes.login);
app.get('/', cas.blocker, routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
