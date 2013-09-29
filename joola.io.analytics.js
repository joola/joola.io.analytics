/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */


var express = require('express'),
  http = require('http'),
  https = require('https'),
  path = require('path'),
  fs = require('fs'),
  nconf = require('nconf'),
  logger = require('joola.io.logger'),
  app;

require('nconf-http');

var status = '';
var httpServer, httpsServer;
var app = global.app = express();

var joola = {};
global.joola = joola;
joola.config = nconf;
joola.logger = logger;

//Configuration
var loadConfig = function (callback) {
  joola.config.argv()
    .env();

  try {
    nconf.use('http', { url: 'http://localhost:40001/conf/joola.io.analytics',
      callback: function (err) {
        if (err) {
          console.log(err);
        }
        joola.config.file({ file: joola.config.get('conf') || './config/joola.io.analytics.json' });
        //Configuration loaded

        //Validate config
        if (!joola.config.get('version'))
          throw new Error('Failed to load configuration file');

        console.log(joola.config.get('loglevel'));
        joola.logger.setLevel(joola.config.get('loglevel'));
        callback();
      }
    });
  }
  catch (ex) {
    console.log(ex);
  }
};

var setupApplication = function (callback) {
//Setup application and logging

  var winstonStream = {
    write: function (message, encoding) {
      joola.logger.info(message);
    }
  };
  app.use(express.logger((global.test ? function (req, res) {
  } : {stream: winstonStream})));

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon('public/assets/ico/favicon.ico'));
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({expires: new Date(Date.now() + 1200000)}));

  callback();
};

var setupRoutes = function (callback) {
  var
    login = require('./routes/login'),
    serveSDK = require('./routes/serveSDK'),
    index = require('./routes/index');

  app.get('/', index.index);
  app.get('/index', index.index2);
  app.get('/homepage', index.homepage);
  app.get('/login', login.index);
  app.get('/login.do', login.login);
  app.post('/login.do', login.login);
  app.get('/joola*.js', serveSDK.serveSDK);

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);

  app.use(function (error, req, res, next) {
    res.status(500);
    res.render('page500', { title: 'Page error - Joola Analytics', error: error });
  });

  app.use(function (req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
      res.render('page404', { title: 'Page not found - Joola Analytics' });
      return;
    }

    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
  });

  callback();
};


var startHTTP = function (callback) {
  var result = {};
  try {
    var _httpServer = http.createServer(app).listen(joola.config.get('server:port'),function (err) {
      if (err) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }
      status = 'Running';
      joola.logger.info('Joola Analytics HTTP server listening on port ' + joola.config.get('server:port'));
      result.status = 'Success';
      httpServer = _httpServer;
      return callback(result);
    }).on('error',function (ex) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }).on('close', function () {
        status = 'Stopped';
        joola.logger.warn('Joola Analytics HTTP server listening on port ' + (joola.config.get('server:port')).toString() + ' received a CLOSE command.');
      });
  }
  catch (ex) {
    result.status = 'Failed: ' + ex.message;
    return callback(result);
  }
  return null;
};

var startHTTPS = function (callback) {
  var result = {};
  try {
    var secureOptions = {
      key: fs.readFileSync(joola.config.get('server:keyFile')),
      cert: fs.readFileSync(joola.config.get('server:certFile'))
    };
    var _httpsServer = https.createServer(secureOptions, app).listen(joola.config.get('server:securePort'),function (err) {
      if (err) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }
      joola.logger.info('Joola Analytics HTTPS server listening on port ' + joola.config.get('server:securePort'));
      result.status = 'Success';
      httpsServer = _httpsServer;
      return callback(result);
    }).on('error',function (ex) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }).on('close', function () {
        joola.logger.warn('Joola Analytics HTTPS server listening on port ' + joola.config.get('server:securePort').toString() + ' received a CLOSE command.');
      });
  }
  catch (ex) {
    result.status = 'Failed: ' + ex.message;
    return callback(result);
  }
  return null;
};

//Control Port
var setupControlPort = function (callback) {
  var cp = require('node-controlport');
  var cp_endpoints = [];

  cp_endpoints.push({
    endpoint: 'status',
    exec: function (callback) {
      callback({status: status, pid: process.pid});
    }
  });

  cp_endpoints.push({
      endpoint: 'start',
      exec: function (callback) {
        if (joola.config.get('server:secure') === true) {
          startHTTP(function () {
            startHTTPS(callback);
          });
        }
        else {
          startHTTP(callback);
        }
      }
    }
  );

  cp_endpoints.push({
    endpoint: 'stop',
    exec: function (callback) {
      var result = {};
      result.status = 'Success';
      try {
        httpServer.close();
        if (joola.config.get('server:secure') === true)
          httpsServer.close();

        process.exit(0);
      }
      catch (ex) {
        console.log(ex);
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }
      return callback(result);
    }
  });

  cp.start(joola.config.get('server:controlPort:port'), cp_endpoints, callback);
};

var done = function () {
  joola.logger.info('Initialization complete.');
};

loadConfig(function () {
  joola.logger.debug('Configuration loaded, version: ' + joola.config.get('version'));

  setupApplication(function () {
    joola.logger.debug('Application setup complete, running.');

    setupRoutes(function () {
      joola.logger.debug('Routes configured');

      setupControlPort(function () {
        joola.logger.info('Control port running on port ' + joola.config.get('server:controlPort:port'));

        startHTTP(function () {
          joola.logger.debug('HTTP running');

          if (joola.config.get('server:secure') === true) {
            startHTTPS(function () {
              joola.logger.debug('HTTPS running');

              done();
            });
          }
          else
            done();
        });
      });
    });
  });
});


