
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var feeds = require('./routes/feeds');
var login = require('./routes/login');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERT12312Y'}));
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/feeds/reports', feeds.reports);
app.get('/feeds/dashboards', feeds.dashboards);
app.get('/feeds/realtime', feeds.realtime);
app.get('/login', login.index);
app.get('/logout', login.logout);
app.post('/login', login.login);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
