'use strict';

/**
 * Logger minimaliste qui filtre automatiquement les valeurs sensibles
 * (tokens, secrets) pour éviter qu'elles ne finissent dans des logs
 * partagés (console d'hébergeur, fichiers, etc.).
 */

const SENSITIVE_PATTERNS = [/[MN][A-Za-z\d_-]{23,}\.[A-Za-z\d_-]{6}\.[A-Za-z\d_-]{27,}/g];

function sanitize(input) {
  let str = typeof input === 'string' ? input : safeStringify(input);
  for (const pattern of SENSITIVE_PATTERNS) {
    str = str.replace(pattern, '[REDACTED_TOKEN]');
  }
  return str;
}

function safeStringify(value) {
  try {
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  } catch {
    return '[Impossible à sérialiser]';
  }
}

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info(...args) {
    console.log(`[INFO]  ${timestamp()} -`, ...args.map(sanitize));
  },
  warn(...args) {
    console.warn(`[WARN]  ${timestamp()} -`, ...args.map(sanitize));
  },
  error(...args) {
    console.error(`[ERROR] ${timestamp()} -`, ...args.map(sanitize));
  },
  debug(...args) {
    if (process.env.DEBUG === 'true') {
      console.debug(`[DEBUG] ${timestamp()} -`, ...args.map(sanitize));
    }
  },
};

module.exports = logger;
