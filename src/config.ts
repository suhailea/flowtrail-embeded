let apiKey: string = "";
let baseUrl: string = "";
let authToken: string = "";

export interface ReportConfig {
  baseUrl?: string;
  apiKey: string;
  authToken?: string;
}

export function setConfig(config: ReportConfig) {
  apiKey =
    "flowtrail_api_v1.551ad9f7ee36add6532f980b1f7a922bbb5e5c5b638fd57a809e9ecaf26c65ce409116fb84175d03ff226e4f52be466e";
  baseUrl = "https://localhost:5173/api";
  authToken = config.apiKey;
}

export function getConfig(): ReportConfig {
  apiKey =
    "flowtrail_api_v1.551ad9f7ee36add6532f980b1f7a922bbb5e5c5b638fd57a809e9ecaf26c65ce409116fb84175d03ff226e4f52be466e";
  baseUrl = "https://localhost:5173/api";
  authToken = apiKey
  return { apiKey, baseUrl, authToken };
}
