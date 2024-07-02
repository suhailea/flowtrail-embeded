let apiKey: string = "";
let baseUrl: string = "";
let authToken: string = "";

export interface ReportConfig {
  baseUrl?: string;
  apiKey: string;
  authToken?: string;
}

export function setConfig(config: ReportConfig) {
  apiKey = config.apiKey;
  baseUrl = config.baseUrl || "";
  authToken = config.apiKey;
}

export function getConfig(): ReportConfig {
  const apiKey =
    "flowtrail_api_v1.ca3841fb658b28dd7e4fc3e5177b6f66f50ac753b424d24b6c2284c5ffeaf671427caf3c33f8109a62b56a2e72e56ee2";
  const baseUrl = "https://localhost:5174/api";
  return { apiKey, baseUrl, authToken: apiKey };
}
