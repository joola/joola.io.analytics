global.loggername = 'joola.analytics';

var express = require('express'),
    login = require('./routes/login'),
    serveSDK = require('./routes/serveSDK'),
    index = require('./routes/index'),
    http = require('http'),
    path = require('path'),
    logger = require('./lib/shared/logger'),
    fs = require('fs');


//TODO: Remove this

var configFile = './config/joola.analytics.sample.js';
if (process.env.JOOLA_CONFIG_ANALYTICS && process.env.JOOLA_CONFIG_ANALYTICS != '') {
    logger.info('Loading configuration file from [' + process.env.JOOLA_CONFIG_ANALYTICS + ']');
    configFile = process.env.JOOLA_CONFIG_ANALYTICS
}
else {
    logger.warn('Using sample configuration file from [' + configFile + ']');
}

global.joola = {};
joola.config = {};
joola.config.general = require(configFile).configData.general;
joola.config.joolaServer = require(configFile).configData.joolaServer;
joola.config.cache = require(configFile).configData.cache;


var app = express();

// all environments
app.set('port', joola.config.general.port || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon('public/assets/ico/favicon.ico'));
app.use(express.compress());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({expires: new Date(Date.now() + 1200000)}));

var winstonStream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

app.use(express.logger({stream: winstonStream}));

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

http.createServer(app).listen(app.get('port'), function () {
    logger.info('Joola Analytics server listening on port ' + app.get('port'));
});
