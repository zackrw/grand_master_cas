
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { name: req.session.cas_user, title: 'Grand Master CAS' });
};

exports.splash = function(req, res){
  res.render('splash', { name: req.session.cas_user, title: 'Grand Master CAS' });
};

exports.login = function(req, res) {
  res.redirect('/');
}
