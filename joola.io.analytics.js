global.loggername = 'joola.analytics';

var express = require('express'),
  login = require('./routes/login'),
  serveSDK = require('./routes/serveSDK'),
  index = require('./routes/index'),
  http = require('http'),
  https = require('https'),
  path = require('path'),
  logger = require('./lib/shared/logger'),
  fs = require('fs');


//TODO: Remove this
var configFile = './config/joola.analytics.sample.js';
if (process.env.JOOLA_CONFIG_ANALYTICS && process.env.JOOLA_CONFIG_ANALYTICS !== '') {
  logger.info('Loading configuration file from [' + process.env.JOOLA_CONFIG_ANALYTICS + ']');
  configFile = process.env.JOOLA_CONFIG_ANALYTICS;
}
else {
  logger.warn('Using sample configuration file from [' + configFile + ']');
}

global.joola = {};
joola.config = {};
joola.config.general = {};
joola.config.port = 42111;
joola.config.joolaServer = {};
joola.config.cache = {};
try {
  joola.config.general = require(configFile).configData.general;
  joola.config.joolaServer = require(configFile).configData.joolaServer;
  joola.config.cache = require(configFile).configData.cache;
}
catch (ex) {
}
var app = global.app = express();

var winstonStream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};

app.use(express.logger((global.test ? function (req, res) {
} : {stream: winstonStream})));


// all environments
//app.set('port', joola.config.general.port || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon('public/assets/ico/favicon.ico'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({expires: new Date(Date.now() + 1200000)}));


process.env.JOOLA_CONFIG_ANALYTICS_HOMEPAGE = 'c:\\dev\\joola-analytics\\public\\homepage.html';


/*
 app.all('/', function (req, res, next) {
 if (req.session.token) {
 res.setHeader('joola-token', req.session.token);
 next();
 } else {

 //we don't have a session
 //check if we a homepage to show
 var homepage = process.env.JOOLA_CONFIG_ANALYTICS_HOMEPAGE;

 login.checkLoginNeeded(function (needed) {
 if (needed) {
 next(false);
 //res.render('login', { title: 'Joola Analytics' });
 //return;
 }
 else {
 if (homepage) {
 console.log('test1');
 res.render('homepage', {title: 'Joola Analytics Demo'});
 next(true);
 }
 else {
 console.log('test2');
 res.render('index', { jarvisToken: '1234'});
 next(false);
 }
 }
 });
 }
 });*/
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


var status = '';
var httpServer, httpsServer;

var startHTTP = function (callback) {
  var result = {};
  try {
    var _httpServer = http.createServer(app).listen(joola.config.general.port || 42111,function (err) {
      if (err) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }
      status = 'Running';
      logger.info('Joola Analytics HTTP server listening on port ' + joola.config.general.port || 42111);
      result.status = 'Success';
      httpServer = _httpServer;
      return callback(result);
    }).on('error',function (ex) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }).on('close', function () {
        status = 'Stopped';
        logger.warn('Joola Analytics HTTP server listening on port ' + (joola.config.general.port || 42111).toString() + ' received a CLOSE command.');
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
      key: fs.readFileSync(joola.config.general.keyFile),
      cert: fs.readFileSync(joola.config.general.certFile)
    };
    var _httpsServer = https.createServer(secureOptions, app).listen(joola.config.general.securePort || 443,function (err) {
      if (err) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }
      logger.info('Joola Analytics HTTPS server listening on port ' + joola.config.general.port || 80);
      result.status = 'Success';
      httpsServer = _httpsServer;
      return callback(result);
    }).on('error',function (ex) {
        result.status = 'Failed: ' + ex.message;
        return callback(result);
      }).on('close', function () {
        logger.warn('Joola Analytics HTTPS server listening on port ' + (joola.config.general.port || 80).toString() + ' received a CLOSE command.');
      });
  }
  catch (ex) {
    result.status = 'Failed: ' + ex.message;
    return callback(result);
  }
  return null;
};

startHTTP(function () {
});
if (joola.config.general.secure)
  startHTTPS(function () {
  });

//Control Port
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
      if (joola.config.general.secure) {
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
      if (joola.config.general.secure)
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

cp.start(42101, cp_endpoints);
