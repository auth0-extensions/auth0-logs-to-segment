const async = require('async');
const Segment = require('analytics-node');
const tools = require('auth0-extension-tools');
const loggingTools = require('auth0-log-extension-tools');

const config = require('../lib/config');
const logger = require('../lib/logger');

module.exports = (storage) =>
  (req, res, next) => {
    const wtBody = (req.webtaskContext && req.webtaskContext.body) || req.body || {};
    const wtHead = (req.webtaskContext && req.webtaskContext.headers) || {};
    const isCron = (wtBody.schedule && wtBody.state === 'active') || (wtHead.referer === 'https://manage.auth0.com/' && wtHead['if-none-match']);

    if (!isCron) {
      return next();
    }

    const analytics = new Segment(config('SEGMENT_KEY'));

    const onLogsReceived = (logs, callback) => {
      if (!logs || !logs.length) {
        return callback();
      }

      logger.info(`Sending ${logs.length} logs to Segment.`);

      async.each(logs, (log, cb) => {
        const event = {
          event: loggingTools.logTypes.get(log.type),
          properties: log
        };

        if (log.user_id) {
          event.userId = log.user_id;
        } else {
          event.anonymousId = log._id;
        }

        analytics.track(event, cb);
      }, callback);
    };

    const slack = new loggingTools.reporters.SlackReporter({
      hook: config('SLACK_INCOMING_WEBHOOK_URL'),
      username: 'auth0-logs-to-segment',
      title: 'Logs To Segment'
    });

    const options = {
      domain: config('AUTH0_DOMAIN'),
      clientId: config('AUTH0_CLIENT_ID'),
      clientSecret: config('AUTH0_CLIENT_SECRET'),
      batchSize: config('BATCH_SIZE'),
      startFrom: config('START_FROM'),
      logTypes: config('LOG_TYPES'),
      logLevel: config('LOG_LEVEL')
    };

    const auth0logger = new loggingTools.LogsProcessor(storage, options);

    return auth0logger
      .run(onLogsReceived)
      .then(result => {
        if (config('SLACK_SEND_SUCCESS') === true || config('SLACK_SEND_SUCCESS') === 'true') {
          slack.send(result.status, result.checkpoint);
        }
        res.json(result);
      })
      .catch(err => {
        slack.send({ error: err, logsProcessed: 0 }, null);
        next(err);
      });
  };
