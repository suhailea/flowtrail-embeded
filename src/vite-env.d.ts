/// <reference types="vite/client" />
export {};
declare global {
  interface Window {
    flowtrailai: {
      init: (config: ReportConfig) => Promise<void>;
    };
  }

  interface HTMLElementTagNameMap {
    "fl-report-viewer": ReportViewer;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fl-report-embed-viewer": ReportEmbedViewer;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fl-dashboard-viewer": DashboardViewer;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fl-report-properties": ReportProperties;
  }
}

// Extend winodw object with flowtrailai object
declare global {
  interface Window {
    flowtrailai: {
      init: (authParams: any) => void;
    };
  }
}
