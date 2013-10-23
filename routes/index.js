var
  http = require('http'),
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
    res.render('index', { joolaioToken: req.session.token, sampleData: joola.config.get('server:sampleData')  });
};

exports.index2 = function (req, res) {
  if (!req.session || !req.session.token) {
    login.checkLoginNeeded(function (needed) {
      if (needed) {
        res.redirect('/login');
      }
      else {
        req.session.token = '123';
        console.log('test');
        res.render('index', { joolaioToken: req.session.token, sampleData: joola.config.get('server:sampleData') });
        console.log('test2');
      }
    });
  }
  else
    res.render('index', {joolaioToken: req.session.token, sampleData: joola.config.get('server:sampleData') });
};

exports.homepage = function (req, res) {
  res.render('homepage');
};

exports.sdktest = function (req, res) {
  res.render('sdktest');
};

exports.test = function (req, res) {
  if (!req.session || !req.session.token) {
    login.checkLoginNeeded(function (needed) {
      if (needed) {
        res.redirect('/login');
      }
      else {
        req.session.token = '123';
        console.log('test');
        res.render('index', { joolaioToken: req.session.token, sampleData: joola.config.get('server:sampleData') });
        console.log('test2');
      }
    });
  }
  else
    res.render('test', {joolaioToken: req.session.token, sampleData: joola.config.get('server:sampleData') });
};