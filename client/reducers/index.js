import { combineReducers } from 'redux';

import { auth } from './auth';
import { config } from './config';
import { logs } from './logs';

export default combineReducers({
  auth,
  config,
  logs
});
