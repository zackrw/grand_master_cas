var libpath = process.env['GMC_COV'] ? '../lib-cov' : '../lib';
var assert  = require('assert');
var util = require('util');
var http = require('http');
var https = require('https');
var sinon = require('sinon');
var cas = require( libpath + '/grand_master_cas' )

describe( 'Grand Master CAS', function(){
  describe('#configure', function(){
    describe('no params', function(){
      before( function(){
        cas.configure({});
      });

      it('should be initialized with default scheme', function(){
        cas.casScheme.should.equal('http');
      });
      it('should be initialized with default ssl', function(){
        cas.ssl.should.equal(false);
      });
      it('should be initialized with default port', function(){
        cas.port.should.equal(80);
      });
      it('should be initialized with default CAS host', function(){
        cas.casHost.should.equal('');
      });
      it('should be initialized with default CAS service', function(){
        cas.service.should.equal('');
      });
      it('should be initialized with default CAS session', function(){
        cas.sessionName.should.equal('cas_user');
      });
      it('should be initialized with renew false', function(){
        cas.renew.should.equal(false);
      });
      it('should be initialized with gateway false', function(){
        cas.gateway.should.equal(false);
      });
      it('should be initialized with the default redirectUrl', function(){
        cas.redirectUrl.should.equal('/');
      });
    });

    describe('params', function(){
      before( function(){
        cas.configure({
          ssl: true,
          casHost: 'secure.its.yale.edu',
          service: 'http://localhost:3000',
          redirectUrl: '/splash',
          sessionName: 'cas_person',
          gateway: false,
          renew: false
        });
      });

      it('should be reconfigured with https scheme', function(){
        cas.casScheme.should.equal('https');
      });
      it('should be reconfigured with ssl true', function(){
        cas.ssl.should.equal(true);
      });
      it('should be reconfigured with default ssl port', function(){
        cas.port.should.equal(443);
      });
      it('should be reconfigured with specified CAS host', function(){
        cas.casHost.should.equal('secure.its.yale.edu');
      });
      it('should be reconfigured with specified CAS session', function(){
        cas.sessionName.should.equal('cas_person');
      });
      it('should be reconfigured with encoded specified CAS service', function(){
        cas.service.should.equal('http%3A%2F%2Flocalhost%3A3000');
      });
      it('should be reconfigured with renew false', function(){
        cas.renew.should.equal(false);
      });
      it('should be reconfigured with gateway false', function(){
        cas.gateway.should.equal(false);
      });
      it('should be reconfigured with the specified redirectUrl', function(){
        cas.redirectUrl.should.equal('/splash');
      });
    });
  });

  describe( '#blocker', function(){
    before( function(){
      cas.configure({
        ssl: true,
        casHost: 'secure.its.yale.edu',
        service: 'http://localhost:3000',
        redirectUrl: '/splash',
        gateway: false,
        renew: false
      });
    });

    it('should call handler', function(){
      var oldhandler = cas.handler;
      cas.handler = sinon.spy();
      cas.blocker();
      assert(cas.handler.calledOnce);
      cas.handler = oldhandler;
    });

    it('should call next if req.session.cas_user', function(){
      var req = {
        session: {
          cas_user:'pod4'
        }
      };
      var res = {};
      var next = sinon.spy();
      cas.blocker(req, res, next, cas.redirectUrl);
      assert(next.calledOnce);
    });

    it('should call handleTicket if req.query.ticket', function(){
      var req = {
        query: {
          ticket:'a ticket'
        },
        session: {}
      };
      var res = {};
      var next = function(){};
      var oldhandleticket = cas.handleTicket;
      cas.handleTicket = sinon.spy();
      cas.blocker(req, res, next, cas.redirectUrl);
      assert(cas.handleTicket.calledOnce);
      cas.handleTicket = oldhandleticket;
    });

    it('should call redirect to splash url if no query and no session var', function(){
      var req = {
        query: {
        },
        session: {
        }
      };
      var res = {};
      var next = function(){};
      res.redirect = sinon.spy();
      cas.blocker(req, res, next, cas.redirectUrl);
      assert(res.redirect.calledWith('/splash'));
    });

  });

  describe( '#bouncer', function(){
    before( function(){
      cas.configure({
        ssl: true,
        casHost: 'secure.its.yale.edu',
        service: 'http://localhost:3000',
        redirectUrl: '/splash',
        gateway: false,
        renew: false
      });
    });

    it('should have the right cas login url', function(){
      var oldhandler = cas.handler;
      var req = {
        query: {
        },
        session: {
        }
      };
      var res = {};
      var next = function(){};
      cas.handler = sinon.spy();
      cas.bouncer(req, res, next)
      var url = 'https://secure.its.yale.edu/cas/login?service=http%3A%2F%2Flocalhost%3A3000';
      assert(cas.handler.calledWith(req, res, next, url));
      cas.handler = oldhandler;
    });

    it('should redirect to cas if no ticket and no cas session', function(){
      var oldhandler = cas.handler;
      var req = {
        query: {
        },
        session: {
        }
      };
      var res = {};
      var next = function(){};
      res.redirect = sinon.spy();
      cas.bouncer(req, res, next)
      var url = 'https://secure.its.yale.edu/cas/login?service=http%3A%2F%2Flocalhost%3A3000';
      assert(res.redirect.calledWith(url));
    });

    it('should call next if req.session.cas_user', function(){
      var req = {
        session: {
          cas_user:'pod4'
        }
      };
      var res = {};
      var next = sinon.spy();
      cas.bouncer(req, res, next);
      assert(next.calledOnce);
    });

    it('should handle a ticket if there is one', function(){
      var req = {
        query: {
          ticket:'a ticket'
        },
        session: {}
      };
      var res = {};
      var next = function(){};
      var oldhandleticket = cas.handleTicket;
      cas.handleTicket = sinon.spy();
      cas.bouncer(req, res, next);
      assert(cas.handleTicket.calledOnce);
      cas.handleTicket = oldhandleticket;
    });

    it('should reject a faulty ticket', function(done){
      if (process.env.TEST_NET){
        this.timeout(5000);
        var req = {
          query: {
            ticket:'afaultyticket'
          },
          session: {}
        };
        var res = {};
        var next = function(){};
        res.redirect = sinon.spy();
        cas.bouncer(req, res, next);
        // Rather than put a callback in, just check every half second.
        setInterval(function(){
          if (res.redirect.calledWith('/splash')) {
            done();
          }
        }, 500);
      } else {
        console.log( 'skipping network test, run TEST_NET=true npm test to ping yale network with faulty ticket' );
        done();
      }
    });

    it('should handle a ticket if there is one', function(){
      var req = {
        session: {
          cas_user: 'abc123'
        }
      };
      var res = {};
      res.redirect = sinon.spy();
      cas.logout(req, res);
      assert(req.session.cas_user === undefined);
      assert(res.redirect.calledOnce);
    });



  });


});
