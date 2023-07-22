import { isBrowser, isNode } from './environment.js';

const DEFAULT_LOG_LEVEL = 'log';

const LOG_LEVEL_MAP = new Map();
LOG_LEVEL_MAP.set('info', 0);
LOG_LEVEL_MAP.set('log', 1);
LOG_LEVEL_MAP.set('warn', 2);
LOG_LEVEL_MAP.set('error', 3);

function logMessage(message, data) {
  return JSON.stringify({
    ts: (new Date()).toISOString(),
    message,
    ...data,
  });
}

function baseLog(logFunc, level, message, data = {}) {
  let logLevel = DEFAULT_LOG_LEVEL;
  if (isBrowser() && window.apus && window.apus.config && window.apus.config.logLevel) {
    logLevel = window.apus.config.logLevel;
  } else if (isNode() && global.apus && global.apus.config && global.apus.config.logLevel) {
    logLevel = global.apus.config.logLevel;
  }

  if (level >= LOG_LEVEL_MAP.get(logLevel)) {
    logFunc(logMessage(message, { ...data, level }));
  }
}

function info(message, data = {}) {
  baseLog(console.info, 0, message, data);
}

function log(message, data = {}) {
  baseLog(console.log, 1, message, data);
}

function warn(message, data = {}) {
  baseLog(console.warn, 2, message, data);
}

function error(message, data = {}) {
  baseLog(console.error, 3, message, data);
}

export {
  info, log, warn, error,
};
