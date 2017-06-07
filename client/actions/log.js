import axios from 'axios';
import * as constants from '../constants';

/*
 * Load the logs history.
 */
export function fetchLogs() {
  return {
    type: constants.FETCH_LOGS,
    payload: {
      promise: axios.get('/api/report', {
        timeout: 5000,
        responseType: 'json'
      })
    }
  };
}

/*
 * Open a log.
 */
export function openLog(log) {
  return {
    type: constants.OPEN_LOG,
    payload: {
      log
    }
  };
}

/*
 * Clear the current logs.
 */
export function clearLog() {
  return {
    type: constants.CLEAR_LOG
  };
}
