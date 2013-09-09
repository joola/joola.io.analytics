var
    utils = require('./utils'),
    winston = require('winston'),
    process = require('process'),
    path = require('path'),
    _ = require('underscore');

require('./winston-splunk');
require('./winston-rotate');

var lastLog = new Date();
var options = {};
options.splunkHost = 'log.joo.la';
options.splunkPort = 7001;
options.level = 'info';
options.silent = false;

var baseDir = path.join(__dirname, '/../../../../');
var logDir = path.join(baseDir, '/log');

var self = this;

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ level: 'debug', json: false, colorize: true, timestamp: function () {
            var tsStart = new Date();
            try {

                if (joola)
                    tsStart = joola.timestamps.start.getTime();
            }
            catch (ex) {
            }
            var output = '[' + process.pid + '] ' + utils.formatDate(new Date(), 'yyyy-mm-dd hh:nn:ss', false) + ', ' + (new Date().getTime() - tsStart).toString() + ' ms, ' + (new Date().getTime() - lastLog.getTime()) + ' ms';
            lastLog = new Date();
            return output;
        } }),
        new winston.transports.splunk(options),
        new winston.transports.File({ level:'debug', filename: logDir +'/' + global.loggername + '.log', json: false, maxsize: 10000000  })
    ], /*,
     exceptionHandlers: [
     new (winston.transports.Console)({ json: false, timestamp: true}),
     new winston.transports.splunk(options),
     new winston.transports.rotateFile(
     {
     filename: path.join(logDir, '/joola.exceptions.log'),         // files will use filename.<date>.log for all files
     level: 'debug',                                       // Set your winston log level, same as original file transport
     timestamp: true,                                    // Set timestmap format/enabled, Same ass original file transport
     maxFiles: 10,                                     // How many days to keep as back log
     json: false                                       // Store logging data ins json format
     }
     )
     //new winston.transports.File({ filename: global.basePath + '/logs/exceptions.log', json: false })
     ],*/
    exitOnError: false
});

//bypass ah/winston bug
_.each(logger.transports, function (t) {
    t.logException = function (err) {
        logger.error(err);
    }
});

module.exports = logger;
