const url = require('url');
const path = require('path');
const morgan = require('morgan');
const Express = require('express');
const bodyParser = require('body-parser');
const tools = require('auth0-extension-tools');
const expressTools = require('auth0-extension-express-tools');

const routes = require('./routes');
const meta = require('./routes/meta');
const hooks = require('./routes/hooks');
const logger = require('./lib/logger');
const config = require('./lib/config');
const processLogs = require('./lib/processLogs');

module.exports = (configProvider, storageProvider) => {
  config.setProvider(configProvider);

  const storage = storageProvider
    ? new tools.WebtaskStorageContext(storageProvider, { force: 1 })
    : new tools.FileStorageContext(path.join(__dirname, './data.json'), { mergeWrites: true });

  const app = new Express();
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
    stream: logger.stream
  }));

  app.use(processLogs(storage));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Configure routes.
  app.use(expressTools.routes.dashboardAdmins({
    secret: config('EXTENSION_SECRET'),
    audience: 'urn:logs-to-segment',
    rta: config('AUTH0_RTA').replace('https://', ''),
    domain: config('AUTH0_DOMAIN'),
    baseUrl: config('PUBLIC_WT_URL') || config('WT_URL'),
    clientName: 'Logs to Segment',
    urlPrefix: '',
    sessionStorageKey: 'logs-to-segment:apiToken',
    scopes: 'read:logs read:users'
  }));
  app.use('/meta', meta());
  app.use('/.extensions', hooks());

  app.use('/app', Express.static(path.join(__dirname, '../dist')));
  app.use('/', routes(storage));

  // Generic error handler.
  app.use(expressTools.middlewares.errorHandler(logger.error.bind(logger)));
  return app;
};
