exports.index = function (req, res) {
  res.render('login', { title: 'Joola Analytics' });
};

exports.checkLoginNeeded = function (next) {
  joola.logger.info('Check login needed...');

  var getter = (joola.config.joolaServer.secure ? require('https') : require('http'));

  var options = {
    host: joola.config.joolaServer.host,
    port: joola.config.joolaServer.port,
    path: '/loginNeeded',
    rejectUnauthorized: false
  };

  getter.get(options,function (response) {
    var body =
      response.on('data', function (chunk) {
        body += chunk;
      });

    response.on('end', function () {
      var responseToken = body.replace('[object Object]', '');
      responseToken = JSON.parse(responseToken);

      if (!responseToken['needed']) {
        joola.logger.info('Login not needed.');
        next(false);
      }
      else {
        joola.logger.info('Login needed.');
        next(true);
      }
    });
  }).on('error', function (ex) {
      joola.logger.error('Failed to check login: ' + ex.message)
      next(false);
    });
};

exports.login = function (req, res) {
  joola.logger.info('Login request for username [' + req.body.username + ']');

  var getter = (joola.config.joolaServer.secure ? require('https') : require('http'));

  var options = {
    host: joola.config.joolaServer.host,
    port: joola.config.joolaServer.port,
    path: '/loginSSO?authToken=' + joola.config.joolaServer.authToken + '&username=' + req.body.username + '&password=' + req.body.password,
    rejectUnauthorized: false
  };

  getter.get(options,function (response) {
    var body =
      response.on('data', function (chunk) {
        body += chunk;
      });

    response.on('end', function () {
      var responseToken = body.replace('[object Object]', '');
      responseToken = JSON.parse(responseToken);

      if (!responseToken['joola-token']) {
        joola.logger.error('Login failed for username [' + req.body.username + '].');
        res.redirect('/login/?error=1');
        return;
      }
      joola.logger.info('Login success for username [' + responseToken.user.displayName + ']');
      req.session.token = responseToken['joola-token'];
      res.redirect('/');
    });
  }).on('error', function (e) {
      joola.logger.error('Login failed for username [' + req.body.username + ']: ' + e.message);
      res.redirect('/login/?error=1');
    });

};