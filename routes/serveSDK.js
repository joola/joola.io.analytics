var
    fs = require('fs');

var sdkVersion = require('../node_modules/joola-sdk/package.json').version;
var cachedSDK = '';

fs.readFile('node_modules/joola-sdk/bin/joola.js', 'utf8', function (err, data) {
    if (err)
        throw new Error('Failed to load SDK: ' + err);
    else
        cachedSDK = data;
});

var parseRequest = function (req) {
    var request = {
        token: '123',
        host: '',
        port: 0,
        user: null
    }

    return request;
}

var processSDK = function (sdk, req) {
    var _sdk = sdk;

    _sdk = sdk.replace(/\[\[JARVIS-VERSION\]\]/g,sdkVersion);
    _sdk = _sdk.replace(/\[\[JARVIS-TOKEN\]\]/g, req.token);
    _sdk = _sdk.replace(/\[\[JARVIS-BOOTSTRAP\]\]/g, 'true');
    _sdk = _sdk.replace(/\[\[JARVIS-HOST\]\]/g, joola.config.joolaServer.host);
    _sdk = _sdk.replace(/\[\[JARVIS-ENDPOINT-CONTENT\]\]/g, '');
    _sdk = _sdk.replace(/\[\[JARVIS-ENDPOINT-QUERY\]\]/g, '');
    _sdk = _sdk.replace(/\[\[JARVIS-ENDPOINT-API\]\]/g, '');

    return _sdk;
}

exports.serveSDK = function (req, res) {
    var request = parseRequest(req);

    var body = processSDK(cachedSDK, request);

    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Content-Length', body.length);
    res.setHeader('joola-token', request.token);

    res.end(body);
};