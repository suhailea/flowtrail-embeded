import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import Chart from "chart.js/auto";
import apiClient from "./api-client";
import "./report-properties";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("fl-report-embed-viewer")
export class ReportEmbedViewer extends LitElement {
  @property({ type: String })
  reportId: string = "";

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

  paramValues: any = {};

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
    const datasets = this.report.yAxis.map((axis: any) => {
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
    const canvasId = `chart-${this.reportId}`;
    const canvasElement = this.renderRoot.querySelector(
      `#${canvasId}`
    ) as HTMLCanvasElement;

    this.chart = new Chart(canvasElement, {
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
  getChartType(type: any) {
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
  extractData(field: any) {
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
  async resolveDataSources(paramValues: any = {}) {
    this.loading = true;
    // Make a request to the server to resolve the queries
    // const params = { ids: report.dataSources.map((e) => e.id) };
    const params = {
      ids: this.report.dataSources?.map((e: any) => e.id),
      multiple: true,
      params: paramValues,
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
      ...Object.keys(report).reduce((acc: any, key) => {
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
    super.connectedCallback();

    // Get report from the server
    await this.getReport();

    // Resolve data sources
    await this.resolveDataSources();

    // Build the chart
    this.buildChart();
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
    return html`
      <div class="flex table-header" style="font-weight: bold;">
        ${columns.map(
          (col: any) => html`
            <div class="flex-1 text-center" style="width: ${col.width}px;">
              ${col.title}
            </div>
          `
        )}
      </div>
      <div class="flex flex-col table-body">
        ${data.map(
          (row: any) => html`
            <div class="flex table-row">
              ${columns.map(
                (col: any) => html`
                  <div
                    class="flex-1 text-center"
                    style="width: ${col.width}px;"
                  >
                    ${row[col.field.field]}
                  </div>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  async handleValueChange(e: CustomEvent, param: any) {
    const value = e.detail.value;
    // console.log(this.report, value);

    // Get the parameters from the report
    const params = this.report?.parameters || [];

    // Now we need to prepare the param values
    // based on the parameters in the report
    const paramValues = params.reduce((acc: any, p: any) => {
      if (p.name === param.name) acc[p.name] = value[p.name];
      return acc;
    }, {});

    // Set the param values
    this.paramValues = {
      ...this.paramValues,
      ...paramValues,
    };

    console.log(this.paramValues, "paramValues");

    // Execute the query
    await this.resolveDataSources(this.paramValues);

    // Build the chart
    this.buildChart();
  }

  render() {
    // Create a canvas id based on the report id to attach the chart
    // to the canvas
    const id = `chart-${this.reportId}`;
    return html`
      <div
        style="padding: 10px; background: white;margin: 10px; height: 100%;
      width: 100%;"
      >
        <h3 class="flex">${this.report?.name}</h3>
        <div class="flex items-center justify-center">
          ${this.report?.parameters?.map((param: any) => {
            return html`<div style="margin-left: 10px">
              <fl-report-properties
                parameters=${JSON.stringify(param)}
                type=${param.type}
                defaultValue=${param.defaultValue}
                @value-changed=${(e: CustomEvent) =>
                  this.handleValueChange(e, param)}
              ></fl-report-properties>
            </div>`;
          })}
        </div>
        <div>
          ${this.report?.reportType !== "table"
            ? html` <canvas id=${id}></canvas> `
            : this.buildTable()}
        </div>
      </div>
    `;
  }

  static styles = css`
    .flex {
      display: flex;
    }

    .table-header {
      flex-direction: row;
    }

    .table-header > div {
      border: solid 1px #eee;
      padding: 5px;
    }

    .table-body {
      flex-direction: column;
      overflow-y: auto;
      height: 100%;
    }

    .table-row {
      flex-direction: row;
    }

    .table-row > div {
      border: solid 1px #eee;
      padding: 5px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "fl-report-embed-viewer": ReportEmbedViewer;
  }
}
