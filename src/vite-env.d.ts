/// <reference types="vite/client" />

declare global {
  interface HTMLElementTagNameMap {
    "report-viewer": ReportViewer;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "report-embed-viewer": ReportEmbedViewer;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dashboard-viewer": DashboardViewer;
  }
}
