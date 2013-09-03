var
// http = require('http'),
    logger = require('../lib/shared/logger');
    configFile = require('../config/joola.analytics.sample.js');

exports.index = function (req, res) {
    res.render('login', { title: 'Joola Analytics' });
};

exports.checkLoginNeeded = function (next) {
    logger.info('Check login needed...');

    var getter = (joola.config.joolaServer.secure ? require('https') : require('http'));

    var options = {
        host: joola.config.joolaServer.host,
        port: joola.config.joolaServer.port,
        path: '/loginNeeded',
        sampleData: configFile.configData.general.sampleData,
        rejectUnauthorized: false
    };

    getter.get(options,function (response) {
        if (options.sampleData) {
            next(false);
        }
        var body =
            response.on('data', function (chunk) {
                body += chunk;
            });

        response.on('end', function () {
            var responseToken = body.replace('[object Object]', '');
            responseToken = JSON.parse(responseToken);

            if (!responseToken['needed']) {
                logger.info('Login not needed.');
                next(false);
            }
            else {
                logger.info('Login needed.');
                next(true);
            }
        });
    }).on('error', function (e) {
            throw e;
        });
        
};

exports.login = function (req, res) {
    logger.info('Login request for username [' + req.body.username + ']');

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
                logger.error('Login failed for username [' + req.body.username + '].');
                res.redirect('/login/?error=1');
                return;
            }
            logger.info('Login success for username [' + responseToken.user.displayName + ']');
            req.session.token = responseToken['joola-token'];
            res.redirect('/');
        });
    }).on('error', function (e) {
            logger.error('Login failed for username [' + req.body.username + ']: ' + e.message);
            res.redirect('/login/?error=1');
        });

};