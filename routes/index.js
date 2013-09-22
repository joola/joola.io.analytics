var
    http = require('http'),
    logger = require('../lib/shared/logger'),
    login = require('./login'),
    configFile = require('../config/joola.analytics.sample.js');

exports.index = function (req, res) {
    if (!req.session || !req.session.token) {
        login.checkLoginNeeded(function (needed) {
            if (needed) {
                res.redirect('/login');
            }
            else {
                res.redirect('/homepage');
            }
        });
    }
    else
        res.render('index', { joolaioToken: req.session.token, sampleData: configFile.configData.general.sampleData });
};

exports.index2 = function (req, res) {
    if (!req.session || !req.session.token) {
        login.checkLoginNeeded(function (needed) {
            if (needed) {
                res.redirect('/login');
            }
            else {
                req.session.token = '123';
                res.render('index', { joolaioToken: req.session.token, sampleData: configFile.configData.general.sampleData });
            }
        });
    }
    else
        res.render('index', {joolaioToken: req.session.token, sampleData: configFile.configData.general.sampleData });
};

exports.homepage = function (req, res) {
    res.render('homepage');
};