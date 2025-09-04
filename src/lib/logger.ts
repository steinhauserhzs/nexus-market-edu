interface LogContext {
  [key: string]: any;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context
    };

    switch (level) {
      case 'error':
        console.error(`[${timestamp}] ERROR: ${message}`, context || '');
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN: ${message}`, context || '');
        break;
      case 'info':
        console.info(`[${timestamp}] INFO: ${message}`, context || '');
        break;
      case 'debug':
        console.debug(`[${timestamp}] DEBUG: ${message}`, context || '');
        break;
    }

    // In production, you could send logs to an external service
    if (!this.isDevelopment) {
      // Example: send to analytics or logging service
      // analyticsService.track('log', logData);
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    };
    this.log('error', message, errorContext);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();