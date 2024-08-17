import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import apiClient from "./api-client";
import "./fl-report-embed-viewer";
import "./fl-dashboard-viewer";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
// @customElement("fl-report-viewer")
export class ReportViewer extends LitElement {
  /**
   * Shadow root element of the custom element.
   */
  @property({ type: String })
  type: string = "";

  @state()
  data: any = null;

  @state()
  widgets: any[] = [];

  render() {
    // if (!this.root) return;
    console.log(this.type, this.data);

    if (this.type === "dashboard") {
      const dashboardId = this.getAttribute("id") || "";
      return html`
        <div class="fl-report-viewer">
          <h1>${this.data?.id || ""}</h1>
          <p>${this.data?.description}</p>
          <fl-dashboard-viewer
            .reportId=${dashboardId}
            .report=${this.data}
          ></fl-dashboard-viewer>
        </div>
      `;
    } else if (this.type === "report") {
      const reportId = this.data.id || "";
      return html`
        <div class="card">
          <h1>${this.data?.id || ""}</h1>
          <p>${this.data?.description}</p>
          <fl-report-embed-viewer
            .reportId=${reportId}
          ></fl-report-embed-viewer>
        </div>
      `;
    }
  }

  /**
   * Connected callback. The callback is called when the element is
   * connected to the DOM. Render the child elements along with the style and
   * script.
   */
  async connectedCallback() {
    super.connectedCallback();
    await this.getData();

    // Render the component
    this.render();
  }

  async getData() {
    const reportId = this.getAttribute("id");
    if (!reportId) return;

    // Get the report from the server
    const response = await apiClient.get(
      `/reports/published?id=${reportId}`,
      {}
    );
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
    this.data = report.schema;
    this.type = response.type;
    this.widgets = this.data.widgets;
  }

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
    }
    .logo:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.lit:hover {
      filter: drop-shadow(0 0 2em #325cffaa);
    }

    .card {
      padding: 2em;
    }

    .read-the-docs {
      color: #888;
    }

    ::slotted(h1) {
      font-size: 3.2em;
      line-height: 1.1;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em 1.2em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `;
}
