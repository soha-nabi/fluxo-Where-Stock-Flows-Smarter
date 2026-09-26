/**
 * FLUXO Logging & Diagnostic Utility
 * Handles environment-aware logging, error formatting, and performance timing.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private isDev = process.env.NODE_ENV !== "production";

  public debug(message: string, ...args: any[]) {
    if (this.isDev) {
      console.debug(`[FLUXO DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]) {
    if (this.isDev) {
      console.info(`[FLUXO INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]) {
    console.warn(`[FLUXO WARN] ${message}`, ...args);
  }

  public error(message: string, error?: any, ...args: any[]) {
    console.error(`[FLUXO ERROR] ${message}`, error ?? "", ...args);
  }

  public time(label: string) {
    if (this.isDev) {
      console.time(`[FLUXO TIMING] ${label}`);
    }
  }

  public timeEnd(label: string) {
    if (this.isDev) {
      console.timeEnd(`[FLUXO TIMING] ${label}`);
    }
  }
}

export const logger = new Logger();
