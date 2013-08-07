var
    http = require('http'),
    logger = require('../lib/shared/logger'),
    login = require('./login');

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
        res.render('index', { jarvisToken: req.session.token });
};

exports.index2 = function (req, res) {
    if (!req.session || !req.session.token) {
        login.checkLoginNeeded(function (needed) {
            if (needed) {
                res.redirect('/login');
            }
            else {
                req.session.token = '1234567890';
                res.render('index', { jarvisToken: req.session.token });
            }
        });
    }
    else
        res.render('index', { jarvisToken: req.session.token });
};

exports.homepage = function (req, res) {
    res.render('homepage');
};