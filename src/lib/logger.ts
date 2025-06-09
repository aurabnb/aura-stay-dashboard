/**
 * Logging utility for AuraBNB application
 * Provides structured logging with different levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  component?: string;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
      component,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const component = entry.component ? `[${entry.component}]` : '';
    return `${timestamp} ${levelName} ${component} ${entry.message}`;
  }

  debug(message: string, data?: any, component?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data, component);
      console.debug(this.formatMessage(entry), data);
    }
  }

  info(message: string, data?: any, component?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, data, component);
      console.info(this.formatMessage(entry), data);
    }
  }

  warn(message: string, data?: any, component?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, data, component);
      console.warn(this.formatMessage(entry), data);
    }
  }

  error(message: string, error?: Error | any, component?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, error, component);
      console.error(this.formatMessage(entry), error);
    }
  }

  // Development-only logging
  devLog(message: string, data?: any, component?: string): void {
    if (this.isDevelopment) {
      this.debug(message, data, component);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (message: string, data?: any, component?: string) => logger.debug(message, data, component),
  info: (message: string, data?: any, component?: string) => logger.info(message, data, component),
  warn: (message: string, data?: any, component?: string) => logger.warn(message, data, component),
  error: (message: string, error?: Error | any, component?: string) => logger.error(message, error, component),
  dev: (message: string, data?: any, component?: string) => logger.devLog(message, data, component),
}; 