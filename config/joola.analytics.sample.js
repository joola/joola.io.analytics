var configData = {};

/////////////////////////
// General Information //
/////////////////////////

configData.general = {
    serverName: "joola-analytics",
    id: "joola-analytics-server",
    serverToken: "joola-analytics-server",
    flatFileDirectory: __dirname + "/public/",
    developmentMode: true,
    port: 80,
    securePort: 443,
    secure: false,
    keyFile: __dirname + '/certs/key.pem',
    certFile: __dirname + '/certs/cert.pem'
};

configData.cache = {

};

configData.joolaServer = {
    host: "127.0.0.1",
    port: 8080,
    secure: true,
    contentHost: 'https://127.0.0.1',
    bootstrap: 'false',
    "authToken": "d2ead440-eb12-11e2-91e2-0800200c9a66",
    loginRedirectUrl: null
};

exports.configData = configData;