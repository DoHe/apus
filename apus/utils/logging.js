function logMessage(message, data) {
  return JSON.stringify({
    ts: (new Date()).toISOString(),
    message,
    ...data,
  });
}

function info(message, data = {}) {
  console.info(logMessage(message, data));
}

function log(message, data = {}) {
  console.log(logMessage(message, data));
}

function warn(message, data = {}) {
  console.warn(logMessage(message, data));
}

function error(message, data = {}) {
  console.error(logMessage(message, data));
}

export {
  info, log, warn, error,
};
