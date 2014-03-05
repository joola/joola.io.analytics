var joolaio = require('joola.io.sdk');

exports.index = function (req, res) {
  res.render('login');
}

exports.logout = function (req, res) {
  delete req.session.jtoken;
  res.redirect('/login');
}

exports.login = function (req, res) {
  var options = {
    host: 'https://localhost:8081'
  };
  console.log(req.body);
  joolaio.init(options, function (err, result) {
    if (err)
      throw err;
    

        
    joolaio.users.authenticate('joola', 'admin', 'password', function (err, token) {
      if (err)
        res.redirect('/login');
      else {
        joolaio.TOKEN = token._;
        joolaio.USER = token.user;
        req.session.jtoken = joolaio.TOKEN;
        req.session.displayName = joolaio.USER.displayName;
        res.redirect('/');  
      }
    });
    
  });
};
