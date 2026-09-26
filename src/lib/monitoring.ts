/**
 * Sentry & Performance Monitoring Helper
 * Captures exceptions, user sessions, and custom performance marks.
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  context?: Record<string, any>;
  timestamp: string;
}

class MonitoringService {
  private dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  public captureException(error: Error | unknown, context?: Record<string, any>) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    const report: ErrorReport = {
      message: errObj.message,
      stack: errObj.stack,
      context,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === "development") {
      console.error("[Monitoring Captured Exception]:", report);
    }

    // Window global Sentry forwarder if initialized
    if (typeof window !== "undefined" && (window as any).Sentry) {
      (window as any).Sentry.captureException(errObj, { extra: context });
    }
  }

  public mark(markName: string) {
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(markName);
    }
  }

  public measure(name: string, startMark: string, endMark: string) {
    if (typeof window !== "undefined" && "performance" in window) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name, "measure");
        const duration = entries[entries.length - 1]?.duration;
        if (duration && process.env.NODE_ENV === "development") {
          console.log(`[Profiling Measure] ${name}: ${duration.toFixed(2)}ms`);
        }
      } catch (e) {
        // Mark missing
      }
    }
  }
}

export const monitoring = new MonitoringService();
