const isDev = import.meta.env.MODE === 'development';

const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => isDev && console.error(...args),
  warn: (...args) => isDev && console.warn(...args),
  debug: (...args) => isDev && console.debug(...args),
  info: (...args) => isDev && console.info(...args),
};

export default logger;
