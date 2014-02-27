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
    
    joolaio.TOKEN = '12345';
    req.session.jtoken = joolaio.TOKEN;
    res.redirect('/');
    /*
    joolaio.users.authenticate('joola', 'admin', 'password', function (err, token) {
      //TODO: Waiting for fix #264
      //joolaio.TOKEN = token._;

      //joola.io is now ready for work, event `core.ready` is emitted
      
      
      
    });
    */
  });
};
