const router = require('express').Router;
const middlewares = require('auth0-extension-express-tools').middlewares;

const config = require('../lib/config');
const processLogs = require('../lib/processLogs');
const htmlRoute = require('./html');

module.exports = (storage) => {
  const app = router();
  const authenticateAdmins = middlewares.authenticateAdmins({
    credentialsRequired: true,
    secret: config('EXTENSION_SECRET'),
    audience: 'urn:logs-to-segment',
    baseUrl: config('PUBLIC_WT_URL') || config('WT_URL'),
    onLoginSuccess: (req, res, next) => next()
  });

  const managementApi = middlewares.managementApiClient({
    domain: config('AUTH0_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET'),
  });

  app.get('/', htmlRoute());
  app.post('/', managementApi, processLogs(storage));

  app.get('/api/report', authenticateAdmins, (req, res, next) =>
    storage.read()
      .then(data => res.json((data && data.logs) || []))
      .catch(next));

  return app;
};
