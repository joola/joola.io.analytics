var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    logger = require('./lib/shared/logger');

var app = express();

// all environments
app.set('port', process.env.PORT || 333);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
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

http.createServer(app).listen(app.get('port'), function () {
    logger.info('Joola Analytics server listening on port ' + app.get('port'));
});
