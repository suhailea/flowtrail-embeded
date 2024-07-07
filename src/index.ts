import { ReportConfig, setConfig } from "./config";
import { ReportViewer } from "./fl-report-viewer";

// Export the inner components to be used outside the project
export { DashboardViewer } from "./fl-dashboard-viewer";
export { ReportViewer } from "./fl-report-viewer";
export { setConfig, getConfig } from "./config";
export { ReportEmbedViewer } from "./fl-report-embed-viewer";

const library = {
  /**
   * Initialize the report viewer. The user should pass the AWS id token
   * and yomly access token as part of the initialization code. Including the file
   * won't be inializing the report viewer. The user should call this method to
   * initialize the report viewer.
   *
   * @param {object} config - Configuration object
   */
  init: async (config: ReportConfig) => {
    // If no config is provided, throw error
    if (!config) throw new Error("Config is required, yomly report viewer.");

    // If no api token or password is provided, throw error
    if (!config.apiKey)
      throw new Error("Invalid configuration for flowtrail report viewer.");

    // Update the configuration object. This will set the global
    // configuration object for the report viewer.
    setConfig(config);

    // In case of access token and id token is passed, we don't need to authenticate
    // the user. We can directly use the token to make requests to the server.
    // If the token is not passed, then we need to authenticate the user to get the token.
    // Send authentication request to the server and store the token in the local storage
    // await apiClient.authenticate(apiToken, apiPassword);

    // Define custom elements. It's important to define the custom
    // elements only after the authentication. So that we can make sure
    // that the token is available for the custom elements.
    customElements.define("fl-report-viewer", ReportViewer);
  },
};

// Export the library objecto the window object
// This should be used when using UMD build. User can
// include the library through script include and
// access the library through window object.
if (window && typeof window !== "undefined") window.flowtrailai = library;
export const FlowtrailAI = library;
