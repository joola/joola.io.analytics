var
    fs = require('fs'),
    url = require('url');

var loadSDK = function (req, res, next) {
    var result = {
        success: true,
        sdk: null,
        version: null,
        timestamp: null,
        etag: null
    };

    delete require.cache[require.resolve('../node_modules/joola-sdk/package.json')]
    result.version = require('../node_modules/joola-sdk/package.json').version;

    fs.readFile('node_modules/joola-sdk/bin/joola.js', function (err, data) {
        if (err) {
            result.success = false;
            throw new Error('Failed to load SDK file: ' + err);
        }
        else {
            fs.stat('node_modules/joola-sdk/bin/joola.js', function (err, stat) {
                if (err) {
                    result.success = false;
                    throw new Error('Failed to load SDK file: ' + err);
                }
                else {
                    result.sdk = data;
                    result.timestamp = stat.mtime;
                    result.etag = stat.size + '-' + Date.parse(stat.mtime);

                    next(req, res, result);
                }
            })
        }
    });
}

var parseRequest = function (req) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    var request = {
        token: query.token,
        host: '',
        port: 0,
        user: null
    }

    return request;
}

var processSDK = function (sdk, request) {
    var _sdk = sdk.sdk.toString()
    var _sdk = _sdk.replace(/\[\[JARVIS-VERSION\]\]/g, sdk.version);
    _sdk = _sdk.replace(/\[\[JARVIS-TOKEN\]\]/g, request.token);
    _sdk = _sdk.replace(/\[\[JARVIS-BOOTSTRAP\]\]/g, 'true');
    _sdk = _sdk.replace(/\[\[JARVIS-HOST\]\]/g, 'http://' + joola.config.joolaServer.host + ':' + joola.config.joolaServer.port);
    _sdk = _sdk.replace(/\[\[JARVIS-ENDPOINT-CONTENT\]\]/g, '');
    _sdk = _sdk.replace(/\[\[JARVIS-ENDPOINT-QUERY\]\]/g, '');
    _sdk = _sdk.replace(/\[\[JARVIS-ENDPOINT-API\]\]/g, '');

    return _sdk;
}


exports.serveSDK = function (req, res) {
    loadSDK(req, res, function (req, res, result) {
        var request = parseRequest(req);
        var body = processSDK(result, request);

        result.etag = request.token + '-' + result.etag;

        res.setHeader('joola-token', request.token);
        res.setHeader('Content-Type', 'text/javascript');
        res.setHeader('Content-Length', body.length);
        res.setHeader('Last-Modified', result.timestamp);
        res.setHeader('Cache-Control', 'public, max-age=31557600');

        if (req.headers['if-none-match'] === result.etag) {
            res.statusCode = 304;
            res.end();
        }
        else {
            res.setHeader('ETag', result.etag);
            res.statusCode = 200;
        }

        res.end(body);
    });
};