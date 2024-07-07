import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import apiClient from "./api-client";
import { ReportEmbedViewer } from "./fl-report-embed-viewer";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("fl-dashboard-viewer")
export class DashboardViewer extends LitElement {
  @property({ type: String })
  reportId: string = "";

  @property()
  widgets: any[] = [];
  /**
   * Shadow root element of the custom element.
   */
  root: ShadowRoot | null = null;

  /**
   * Root element of the custom element.
   */
  rootEl: HTMLDivElement = document.createElement("div");

  /**
   * Report schema. The schema is the definition of the report.
   */
  report: any = null;

  /**
   * Get report schema from server based on the report id.
   * @returns - Report schema
   */
  async getReport() {
    const reportId = this.reportId;
    if (!reportId) return;

    // Get the report from the server
    const response = await apiClient.get(`/reports/${reportId}`, {});
    if (!response) return;

    // Get report from response
    const report = response.report;
    if (!report) return;

    // Attach all selected report props to the internal
    // schema object for easy access from file saver component
    const reportSchema = {
      ...report.schema,

      // Asssigne every props except the reportSchema
      ...Object.keys(report).reduce((acc: any, key) => {
        if (key !== "schema") acc[key] = report[key];
        return acc;
      }, {}),
    };
    report.schema = reportSchema;
    this.report = report.schema;
  }

  /**
   * Connected callback. The callback is called when the element is
   * connected to the DOM. Render the child elements along with the style and
   * script.
   */
  async connectedCallback() {
    console.log("HERE");

    // Define root shadow element
    this.root = this.attachShadow({ mode: "open" });

    // Get report from the server
    if (!this.report) await this.getReport();
    // Render the element
    this.render();
  }
  render() {
    if (!this.root) return;

    // Make sure the shadow root html is cleared
    this.root.innerHTML = "";

    // Add style to the shadow root
    const style = document.createElement("style");
    style.innerHTML = `
    .fl-report-viewer {
    		width: 100%;
    		height: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    	}
    `;
    this.root.appendChild(style);
    this.rootEl.classList.add("fl-report-viewer");

    // Get schema from the report
    const widgts = this.report.widgets || [];
    widgts.forEach((report: any) => {
      const el = document.createElement(
        "fl-report-embed-viewer"
      ) as ReportEmbedViewer;
      el.setAttribute("reportId", report.reportId);
      this.rootEl.appendChild(el);
    });

    // Render the element
    this.root.appendChild(this.rootEl);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dashboard-viewer": DashboardViewer;
  }
}
