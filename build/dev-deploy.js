var
    logger = require('../lib/shared/logger'),
    path = require('path'),
    ncp = require('ncp');

logger.info('Starting build development environment deploy script...');

var basePath = path.join(__dirname + '/..');
var targetDirectory = path.join(basePath + '/../joola-server/node_modules/joola-analytics');

logger.info('Base path: ' + basePath);
logger.info('Target path: ' + targetDirectory);

logger.info('Copying files...');

ncp.limit = 10;
var options = {
    filter: function (filename) {
        return filename.indexOf('git') == -1 && filename.indexOf('.idea') == -1;
    }
};

ncp(basePath, targetDirectory, options, function (err) {
    if (err)
        logger.error('Failed: ' + err);
    else
        logger.info('...Files copied');
    logger.info('Build script finished');
});

