var
    http = require('http'),
    logger = require('../lib/shared/logger');

exports.index = function(req, res){
    res.render('index', { jarvisToken: req.session.token });
};

/*
var
    fs = require('fs');

var loadPage= function (req, res, next) {
    var result = {
        success: true,
        sdk: null,
        version: null,
        timestamp: null,
        etag: null
    };

    fs.readFile('public/index.html', function (err, data) {
        if (err) {
            result.success = false;
            throw new Error('Failed to load index page: ' + err);
        }
        else {
            fs.stat('public/index.html', function (err, stat) {
                if (err) {
                    result.success = false;
                    throw new Error('Failed to stat index file: ' + err);
                }
                else {
                    result.file = data;
                    result.timestamp = stat.mtime;
                    result.etag = stat.size + '-' + Date.parse(stat.mtime);

                    next(req, res, result);
                }
            })
        }
    });
}

var processPage = function (indexpage, request) {
    var _page = indexpage.file.toString()
    _page = _page.replace(/\[\[JARVIS-TOKEN\]\]/g, request.session.token);

    return _page;
}

exports.servePage = function (req, res) {
    loadPage(req, res, function (req, res, result) {
        var body = processPage(result, req);

        result.etag = req.session.token + '-' + result.etag;

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Length', body.length);
        //res.setHeader('Last-Modified', result.timestamp);
        //res.setHeader('Cache-Control', 'public, max-age=31557600');

        
            res.setHeader('ETag', result.etag);
            res.statusCode = 200;
        //}

        res.end(body);
    });
};
*/