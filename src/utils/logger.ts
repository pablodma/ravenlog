/**
 * Utilidad para logging consistente en toda la aplicación
 */

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

export enum LogCategory {
  COMPONENT = 'component',
  API = 'api',
  STATE = 'state',
  USER_ACTION = 'user_action',
  ERROR = 'error'
}

interface LogEntry {
  level: LogLevel
  category: LogCategory
  component: string
  message: string
  data?: any
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(entry: LogEntry): string {
    const emoji = this.getEmoji(entry.level)
    const timestamp = new Date().toISOString()
    return `${emoji} [${timestamp}] ${entry.component}: ${entry.message}`
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.INFO: return '🔄'
      case LogLevel.WARN: return '⚠️'
      case LogLevel.ERROR: return '❌'
      case LogLevel.DEBUG: return '🐛'
      default: return '📝'
    }
  }

  private log(level: LogLevel, category: LogCategory, component: string, message: string, data?: any) {
    if (!this.isDevelopment) return

    const entry: LogEntry = {
      level,
      category,
      component,
      message,
      data,
      timestamp: new Date().toISOString()
    }

    const formattedMessage = this.formatMessage(entry)
    
    switch (level) {
      case LogLevel.INFO:
        console.log(formattedMessage, data ? data : '')
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, data ? data : '')
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, data ? data : '')
        break
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data ? data : '')
        break
    }
  }

  info(component: string, message: string, data?: any) {
    this.log(LogLevel.INFO, LogCategory.COMPONENT, component, message, data)
  }

  warn(component: string, message: string, data?: any) {
    this.log(LogLevel.WARN, LogCategory.COMPONENT, component, message, data)
  }

  error(component: string, message: string, data?: any) {
    this.log(LogLevel.ERROR, LogCategory.ERROR, component, message, data)
  }

  debug(component: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, LogCategory.COMPONENT, component, message, data)
  }

  api(component: string, message: string, data?: any) {
    this.log(LogLevel.INFO, LogCategory.API, component, message, data)
  }

  state(component: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, LogCategory.STATE, component, message, data)
  }

  userAction(component: string, message: string, data?: any) {
    this.log(LogLevel.INFO, LogCategory.USER_ACTION, component, message, data)
  }
}

export const logger = new Logger()




