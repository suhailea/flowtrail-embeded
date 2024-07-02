import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import Chart from "chart.js/auto";
import apiClient from "./api-client";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("report-embed-viewer")
export class ReportEmbedViewer extends LitElement {
  @property({ type: String })
  reportId: string = "";

  root: ShadowRoot | null = null;

  /**
   * Root element of the custom element.
   */
  rootEl: HTMLDivElement = document.createElement("div");
  /**
   * DOM element to attach the chart. This should be
   * canvas object
   */
  chartEl: HTMLCanvasElement = document.createElement("canvas");

  /**
   * Is loading. The element is requesting for data and schema from server
   */
  @property()
  loading = true;

  /**
   * Report schema. The schema is the definition of the report.
   */
  @property()
  report: any = null;

  /**
   * Chartjs instance
   */
  @property()
  chart: any = null;

  /**
   * Data sources
   */
  @property()
  dataSources: any[] = [];

  /**
   * Build the chart based on config
   */
  buildChart() {
    // Destroy the chart instance if it exists
    if (this.chart) this.chart.destroy();
    if (this.report === undefined) return;

    // If the report type is table, then return
    if (
      this.report.reportType === "table" ||
      this.report.reportType === "template"
    )
      return;

    // If no data source found then return
    // if (!dataSources || !dataSources.length) return;

    // Common chart options
    let options: any = {};

    // If the chart has a title, then add it to the options
    if (this.report.title)
      options.title = { display: true, text: this.report.title };

    // If responsive flag is set to true, then add it to the options
    if (this.report.responsive) options.responsive = true;

    // Make the chart horizontal if the config has horizontal flag
    if (this.report.indexAxis === "y") options.indexAxis = "y";
    // Resolve the data set. Attach datasource name to the
    // the data object
    const dataset = this.report.data || {};
    if (!Object.keys(dataset).length) return;

    // Prepare data based on the dataset and chart data fields
    // used in the x & y axis.
    const dsId = this.dataSources[0]?.id;
    if (!dsId) return;

    // Chart js accepts x axis as labels property and
    // y axis as dataset list. So prepare the data in that format
    // First get the x and build labels array;
    if (!this.report.xAxis) return;
    const labels = this.extractData(this.report.xAxis.field);
    // If no y axis is present, then return
    if (!this.report.yAxis || !this.report.yAxis.length) return;

    // Iterate over each y axis config and build the datasets
    // for the chart js config
    const datasets = this.report.yAxis.map((axis) => {
      // Extract data
      const dt = this.extractData(axis.field);
      return {
        data: dt,
        fill: "origin",
        label: axis.label,
        borderColor: axis.borderColor,
        borderWidth: axis.borderWidth,
        backgroundColor: axis.backgroundColor,
      };
    });

    // Create a new chart instance
    this.chart = new Chart(this.chartEl, {
      options: {
        ...options,
        responsive: true,
        maintainAspectRatio: false,
      },
      type: this.getChartType(this.report.reportType),
      data: { labels, datasets },
    });
  }

  /**
   * Converts report type to the chart js type
   * @param type - Report type
   * @returns - Chart js type
   */
  getChartType(type) {
    switch (type) {
      case "area":
      case "multi-axis-line":
        return "line";
      default:
        return type;
    }
  }

  /**
   * Extract data from the resolved data source. This will accept a
   * field name and pass the data source. It will then extract the
   * data from the data source and return it.
   * @param field
   * @returns - Array of data
   */
  extractData(field) {
    const data = this.report.data || {};
    if (!data || !field?.dataSourceId) return [];

    // Get the data source id from the field
    const dataSourceId = field.dataSourceId;
    const dataSource = data[dataSourceId] || [];

    // Extract the data from the data source
    return dataSource.map((d: any) => d[field.field]);
  }

  /**
   * Get the data from the API. This will check the chart config
   * object and look for the queries array. If it exists, it will
   * make a request to the server to resolve those queries and
   * return the data.
   */
  async resolveDataSources() {
    this.loading = true;
    // Make a request to the server to resolve the queries
    // const params = { ids: report.dataSources.map((e) => e.id) };
    console.log(this.report.dataSources, "data sources");

    const params = {
      ids: this.report.dataSources?.map((e) => e.id),
      multiple: true,
      paramValues: {},
    };
    this.report.data = await apiClient.post("/datasource/exec", params);
    this.loading = false;
  }

  /**
   * Get report schema from server based on the report id.
   * @returns - Report schema
   */
  async getReport() {
    const reportId = this.reportId;
    console.log("report id", reportId);

    console.log(reportId, "report id");

    if (!reportId) return;

    // Get the report from the server
    const response = await apiClient.get(`/reports/${reportId}`, {});
    if (!response) return;

    // Get report from response
    const report = response.schema;
    if (!report) return;

    // Attach all selected report props to the internal
    // schema object for easy access from file saver component
    const reportSchema = {
      ...report.schema,

      // Asssigne every props except the reportSchema
      ...Object.keys(report).reduce((acc, key) => {
        if (key !== "schema") acc[key] = report[key];
        return acc;
      }, {}),
    };
    report.schema = reportSchema;
    this.report = report.schema;
    this.dataSources = this.report.dataSources;
  }

  /**
   * Connected callback. The callback is called when the element is
   * connected to the DOM. Render the child elements along with the style and
   * script.
   */
  async connectedCallback() {
    // Define root shadow element
    this.root = this.attachShadow({ mode: "open" });

    // Get report from the server
    await this.getReport();

    // Render the element
    this.render();

    // Resolve data sources
    await this.resolveDataSources();

    // Apply styles
    this.applyStyles();

    // Build the chart
    this.buildChart();

    // Build table
    this.buildTable();

    // Build template based report
    this.buildTemplate();
  }

  buildTemplate() {
    // If the report type is table, then return
    if (this.report.reportType !== "table") return;
  }

  buildTable() {
    // If the report type is table, then return
    if (this.report.reportType !== "table") return;

    // Get columns from report config
    const columns = this.report.columns || [];

    // Resolve the data set. Attach datasource name to the
    // the data object
    const dataset = this.report.data || {};
    if (!Object.keys(dataset).length) return;

    // Prepare data based on the dataset and chart data fields
    // used in the x & y axis.
    const dsId = this.dataSources[0]?.id;
    if (!dsId) return;
    const data = dataset[dsId] || [];

    const header = document.createElement("div");
    header.classList.add("flex", "table-header");
    header.style.fontWeight = "bold";
    columns.forEach((col) => {
      const colEl = document.createElement("div");
      colEl.classList.add("flex-1", "text-center");
      colEl.innerText = col.title;

      colEl.style.width = `${col.width}px`;

      header.appendChild(colEl);
    });

    // Render table body
    const body = document.createElement("div");
    body.classList.add("flex", "flex-col", "table-body");

    // Get rows from report config
    data.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.classList.add("flex", "table-row");
      columns.forEach((col) => {
        const colEl = document.createElement("div");
        colEl.classList.add("flex-1", "text-center");
        colEl.innerText = row[col.field.field];
        colEl.style.width = `${col.width}px`;
        rowEl.appendChild(colEl);
      });
      body.appendChild(rowEl);
    });

    this.rootEl?.appendChild(header);
    this.rootEl?.appendChild(body);
  }

  applyStyles() {
    this.rootEl.style.display = "block";
    this.rootEl.style.width = `${this.report.width}px` || "100%";
    this.rootEl.style.height = `${this.report.height}px` || "100%";
  }

  render() {
    if (!this.root) return;
    console.log("rendering");

    // Make sure the shadow root html is cleared
    this.root.innerHTML = "";

    // Add style to the shadow root
    const style = document.createElement("style");
    style.innerHTML = `
    	.fl-report-viewer {
    		width: 100%;
    		height: 100%;
    	}

    	.chart {
    		width: 100%;
    		height: 100%;
    	}

    	.flex {
    		display: flex;

    	}

    	.table-header {
    		flex-direction: row;
    	}

    	.table-header>div {
    		border: solid 1px #eee;
    		padding: 5px;
    	}

    	.table-body {
    		flex-direction: column;
    		overflow-y: auto;
    		height: 100%;
    	}

    	.table-row  {
    		flex-direction: row;
    	}

    	.table-row > div {

    		border: solid 1px #eee;
    		padding: 5px;

    	}
    `;
    this.root.appendChild(style);
    this.rootEl.classList.add("fl-report-viewer");

    if (this.report.reportType !== "table") {
      // Render the element
      this.chartEl.classList.add("chart", "w-full", "h-full");
      this.rootEl.appendChild(this.chartEl);
    }

    // Render the element
    this.root.appendChild(this.rootEl);

    // Render the element
    return html`
            <div class="fl-report-viewer">
              <div class="chart w-full h-full" />
            </div>
        </html>
      `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "report-embed-viewer": ReportEmbedViewer;
  }
}
