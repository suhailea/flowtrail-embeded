import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * A component to handle report properties.
 */
@customElement("fl-report-properties")
export class ReportProperties extends LitElement {
  @property({ type: String }) type: string = "";
  @property()
  parameters: any = {};
  @property({ type: String })
  defaultValue: string = "";

  value: string = "";

  handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    console.log(this.value, target.value);

    const param = JSON.parse(this.parameters);

    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: {
          value: {
            [param.name]: this.value,
          },
        },
      })
    );
  }

  render() {
    if (this.defaultValue && this.defaultValue !== null)
      this.value = this.defaultValue;
    const param = JSON.parse(this.parameters);

    switch (this.type) {
      case "date":
        return html`<div>
          <input type="date" value=${this.value} @change=${this.handleChange} />
        </div>`;
      case "multiselect":
        return html` <select
          multiple
          @change=${this.handleChange}
          .value=${this.value}
        ></select>`;
      case "select":
        return html` <select @change=${this.handleChange} .value=${this.value}>
          ${param.selectValues.split(",").map((value: string) => {
            return html`<option value=${value}>${value}</option>`;
          })}
        </select>`;
      case "sql":
        return html`<textarea
          value=${this.value}
          @change=${this.handleChange}
        ></textarea>`;
      case "number":
        return html`<input
          type="number"
          value=${this.value}
          @change=${this.handleChange}
        />`;
      case "string":
        return html`<input
          type="text"
          value=${this.value}
          @change=${this.handleChange}
        />`;
      case "boolean":
        return html`<input
          type="checkbox"
          .checked=${this.value === "true"}
          @change=${this.handleChange}
        />`;
      default:
        return html`<input
          type="text"
          value=${this.value}
          @change=${this.handleChange}
        />`;
    }
  }

  static styles = css`
    /* Add your styles here */
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "fl-report-properties": ReportProperties;
  }
}
