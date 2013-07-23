global.loggername = 'joola.analytics';

var express = require('express'),
    routes = require('./routes'),
    serveSDK = require('./routes/serveSDK'),
    login = require('./routes/login'),
    index = require('./routes/index'),
    http = require('http'),
    path = require('path'),
    logger = require('./lib/shared/logger');


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
app.use(express.favicon());
app.use(express.compress());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({expires : new Date(Date.now() + 1200000)}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var winstonStream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

app.use(express.logger({stream: winstonStream}));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/login.html', function (req, res) {
    res.sendfile(__dirname + '/public/login.html');
});
app.get('/login.do', login.login);
app.post('/login.do', login.login);

app.all('/', function (req, res, next) {
    if (req.session.token) {
        res.setHeader('joola-token', req.session.token);
        next();
    } else {
        res.redirect('/login.html');
    }
});

app.all('*.html', function (req, res, next) {
    if (req.session.token) {
        res.setHeader('joola-token', req.session.token);
        next();
    } else {
        res.redirect('/login.html');
    }
});

app.all('*', function (req, res, next) {
    if (req.session.token) {
        res.setHeader('joola-token', req.session.token);
        next();
    }
    else
        next();
});

app.get('/', index.servePage);
app.get('/index.html', index.servePage);
app.get('/joola*.js', serveSDK.serveSDK);

http.createServer(app).listen(app.get('port'), function () {
    logger.info('Joola Analytics server listening on port ' + app.get('port'));
});
