var http = require('http');
var https = require('https');

var GrandMasterCas = function(){
  this.configure = this.configure.bind(this);
  this.bouncer = this.bouncer.bind(this);
  this.redirecter = this.redirecter.bind(this);
  this.handler = this.handler.bind(this);
  this.handleTicket = this.handleTicket.bind(this);
  this.logout = this.logout.bind(this);
};

GrandMasterCas.prototype.configure = function(opts){

  this.casScheme = opts.ssl === true ? 'https' : 'http';
  var defaultPort = opts.ssl === true ? 443 : 80;
  this.casHost  = opts.casHost;
  this.port = opts.casPort || defaultPort;

  this.service = encodeURIComponent(opts.service);
  this.sessionName = opts.sessionName || "cas_user";
  this.renew = opts.renew || false;
  this.gateway = opts.gateway || false;
  this.redirectUrl = opts.redirectUrl || '/';
};


GrandMasterCas.prototype.redirecter = function(req, res, next){
  if (!this.redirectUrl) {
    //bad
  } else {
    this.handler(req, res, next, this.redirectUrl);
  }
};

GrandMasterCas.prototype.bouncer = function(req, res, next){
  var redirectUrl = [this.casScheme, '://',
                     this.casHost, "/cas/login?service=",
                     this.service].join("");
  this.handler(req, res, next, redirectUrl);
}

GrandMasterCas.prototype.handler = function(req, res, next, redirectUrl){
  var sessionName = this.sessionName;

  if (req.session[sessionName]) {
    next();
  }
  else if (req.query && req.query.ticket) {
    console.log( req.query.ticket );
    this.handleTicket(req, res, next);
  }
  else {
    console.log( redirectUrl );
    res.redirect(redirectUrl);
  }
};

GrandMasterCas.prototype.handleTicket = function( req, res, next ){
  var ticket = req.query.ticket;
  var sessionName = this.sessionName;
  var service = this.service;
  var path = '/cas/validate?service=' + service + '&ticket=' + ticket;

  var request = https.request({
    host: this.casHost,
    path: path,
    method: 'GET'
  }, function(response){
    var buf = "";
    var redirectUrl;
    response.on('data', function(chunk){
      buf += chunk.toString('utf8');
    });
    response.on('end', function(){
      results = buf.split('\n');
      if (results[0] === 'yes') {
        req.session[sessionName] = results[1];
        next();
      }
      else if (results[0] === 'no') {
        res.redirect(this.redirectUrl);
      }
      else {
        console.log('invalid response from CAS');
      }
    });
    response.on('error', function(err){
      console.log('response error: ' + err);
    });
  });

  request.on( 'error', function(err){
    console.log( 'error: ' + err );
  });

  request.end();
};

GrandMasterCas.prototype.logout = function(req, res){
  var logoutUrl = [this.casScheme, '://',
                   this.casHost, "/cas/logout"].join("");

  delete req.session[this.sessionName];
  // Doesn't destroy the whole session!
  res.redirect(logoutUrl);
};

module.exports = new GrandMasterCas;
