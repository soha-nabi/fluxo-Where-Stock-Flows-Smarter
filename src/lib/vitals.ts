/**
 * Web Vitals Monitoring & Performance Tracking
 * Collects and reports Core Web Vitals (LCP, FID, CLS, TTFB, INP)
 */

export interface Metric {
  id: string;
  name: "LCP" | "FID" | "CLS" | "TTFB" | "INP" | "FCP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries: PerformanceEntry[];
}

type ReportHandler = (metric: Metric) => void;

class VitalsTracker {
  private handlers: ReportHandler[] = [];
  private isInitialized = false;

  public init() {
    if (typeof window === "undefined" || this.isInitialized) return;
    this.isInitialized = true;

    // Observe Performance Timeline for Core Web Vitals
    if ("PerformanceObserver" in window) {
      this.observeLCP();
      this.observeCLS();
      this.observeFID();
      this.observeTTFB();
    }
  }

  public subscribe(handler: ReportHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  private emit(metric: Metric) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    }
    this.handlers.forEach((handler) => handler(metric));
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          const value = lastEntry.startTime;
          this.emit({
            id: `lcp-${Date.now()}`,
            name: "LCP",
            value,
            rating: value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor",
            delta: value,
            entries,
          });
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) {
      // Ignore unsupported browsers
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      let sessionEntries: PerformanceEntry[] = [];
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            sessionEntries.push(entry);
          }
        }
        this.emit({
          id: `cls-${Date.now()}`,
          name: "CLS",
          value: clsValue,
          rating: clsValue <= 0.1 ? "good" : clsValue <= 0.25 ? "needs-improvement" : "poor",
          delta: clsValue,
          entries: sessionEntries,
        });
      });
      observer.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      // Ignore unsupported browsers
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        if (firstInput) {
          const value = (firstInput as any).processingStart - firstInput.startTime;
          this.emit({
            id: `fid-${Date.now()}`,
            name: "FID",
            value,
            rating: value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor",
            delta: value,
            entries: [firstInput],
          });
        }
      });
      observer.observe({ type: "first-input", buffered: true });
    } catch (e) {
      // Ignore unsupported browsers
    }
  }

  private observeTTFB() {
    try {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navEntry) {
        const value = navEntry.responseStart;
        this.emit({
          id: `ttfb-${Date.now()}`,
          name: "TTFB",
          value,
          rating: value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor",
          delta: value,
          entries: [navEntry],
        });
      }
    } catch (e) {
      // Ignore unsupported browsers
    }
  }
}

export const vitalsTracker = new VitalsTracker();
