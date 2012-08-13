var http = require('http');
var fs = require('fs');
var util = require('util');
var cas = require('../../lib/grand_master_cas');


cas.configure({
  casHost: "secure.its.yale.edu",
  ssl: true,
  service: "http://localhost:3000",
  redirectUrl: '/splash'
});

app = http.createServer(function(req, res){

  if (req.url !== '/splash') {
      cas.sessionlessBouncer(req, res, function(){
        fs.readFile( __dirname + '/index.html', 'utf8', function(err, data){
          if (err) {
            console.log( 'error reading file: ' + err );
          }
          res.end(data);
        });
      });
  }
  else {

    fs.readFile( __dirname + '/splash.html', 'utf8', function(err, data){
      if (err) {
        console.log( 'error reading file: ' + err );
      }
      res.end(data);
    });
  }

});

app.listen(3000);
console.log( 'server listening on port 3000' );
