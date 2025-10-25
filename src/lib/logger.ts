/**
 * Sistema de logging condicional
 * Solo muestra logs en desarrollo, excepto errores que siempre se muestran
 */

const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface LoggerOptions {
  prefix?: string;
  timestamp?: boolean;
}

class Logger {
  private prefix: string;
  private timestamp: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || '';
    this.timestamp = options.timestamp !== false;
  }

  private formatMessage(level: LogLevel, ...args: any[]): any[] {
    const parts: any[] = [];

    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }

    parts.push(...args);
    return parts;
  }

  log(...args: any[]) {
    if (isDevelopment) {
      console.log(...this.formatMessage('log', ...args));
    }
  }

  info(...args: any[]) {
    if (isDevelopment) {
      console.info(...this.formatMessage('info', ...args));
    }
  }

  warn(...args: any[]) {
    if (isDevelopment) {
      console.warn(...this.formatMessage('warn', ...args));
    }
  }

  error(...args: any[]) {
    // Los errores SIEMPRE se muestran, incluso en producción
    console.error(...this.formatMessage('error', ...args));
  }

  debug(...args: any[]) {
    if (isDevelopment) {
      console.debug(...this.formatMessage('debug', ...args));
    }
  }

  // Método para crear un logger con un prefijo específico
  createLogger(prefix: string, options?: Omit<LoggerOptions, 'prefix'>): Logger {
    return new Logger({ ...options, prefix });
  }
}

// Exportar instancia por defecto
export const logger = new Logger();

// Exportar factory para crear loggers específicos
export function createLogger(prefix: string, options?: Omit<LoggerOptions, 'prefix'>): Logger {
  return new Logger({ ...options, prefix });
}

// Exportar clase para casos avanzados
export { Logger };
