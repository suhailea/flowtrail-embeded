import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import apiClient from "./api-client";
import "./fl-report-embed-viewer";

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
    super.connectedCallback();
    // Get report from the server
    if (!this.report) await this.getReport();
    // Render the element
    this.render();
  }
  render() {
    // Get schema from the report
    const widgts = this.report.widgets || [];
    console.log(widgts, "WIDGETS");

    return html`
      <div style="display: flex; flex-wrap: wrap">
        ${widgts.map((widget: any) => {
          return html`
            <div
              style="width: ${widget.width}px; height: ${widget.height}px;margin: 15px"
            >
              <fl-report-embed-viewer
                .reportId=${widget.reportId}
              ></fl-report-embed-viewer>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dashboard-viewer": DashboardViewer;
  }
}
