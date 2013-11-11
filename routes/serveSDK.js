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

  delete require.cache[require.resolve('../node_modules/joola.io.sdk/package.json')]
  result.version = require(__dirname + '/../node_modules/joola.io.sdk/package.json').version;

  fs.readFile(__dirname + '/../node_modules/joola.io.sdk/bin/joolaio.js', function (err, data) {
    if (err) {
      result.success = false;
      throw new Error('Failed to load SDK file: ' + err);
    }
    else {
      fs.stat(__dirname + '/../node_modules/joola.io.sdk/bin/joolaio.js', function (err, stat) {
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
};

var parseRequest = function (req) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  var request = {
    token: query.token,
    host: '',
    port: 0,
    user: null,
    req: req
  };

  return request;
};

var processSDK = function (sdk, request) {
  var host = joola.config.get('engine:host');
  if (!host || host == null || host == '') {
    host = request.req.headers.host
    if (host.indexOf(':') > -1)
      host = host.substring(0, host.indexOf(':'));
  }
  
  var _sdk = sdk.sdk.toString();
  _sdk = _sdk.replace(/\[\[JOOLAIO-VERSION\]\]/g, sdk.version);
  _sdk = _sdk.replace(/\[\[JOOLAIO-TOKEN\]\]/g, request.token);
  _sdk = _sdk.replace(/\[\[JOOLAIO-BOOTSTRAP\]\]/g, joola.config.get('engine:bootstrap') || 'true');
  _sdk = _sdk.replace(/\[\[JOOLAIO-HOST\]\]/g, (joola.config.get('engine:secure') ? 'https://' : 'http://') + host + ':' + joola.config.get('engine:port'));
  _sdk = _sdk.replace(/\[\[JOOLAIO-CONTENTHOST\]\]/g, (joola.config.get('engine:contentHost') || '//' + request.req.headers.host));
  _sdk = _sdk.replace(/\[\[JOOLAIO-ENDPOINT-CONTENT\]\]/g, '');
  _sdk = _sdk.replace(/\[\[JOOLAIO-ENDPOINT-QUERY\]\]/g, '');
  _sdk = _sdk.replace(/\[\[JOOLAIO-ENDPOINT-API\]\]/g, '');
  _sdk = _sdk.replace(/\[\[JOOLAIO-LOGINREDIRECTURL\]\]/g, joola.config.get('engine:loginRedirectUrl') || null);

  return _sdk;
};

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