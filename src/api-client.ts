import { getConfig } from "./config";

class ApiClient {
  /**
   * Send GET requesy to the server.
   *
   * @param {string} url - Url to send request
   * @param {object} data - Request data to send to the server
   */
  async get(url: string, data: Record<string, unknown>) {
    return this.makeRequest(url, "GET", data);
  }

  /**
   * Send POST requesy to the server.
   *
   * @param {string} url - Url to send request
   * @param {object} data - Request data to send to the server
   */
  async post(url: string, data: Record<string, unknown>) {
    return this.makeRequest(url, "POST", data);
  }

  /**
   * Send PUT requesy to the server.
   *
   * @param {string} url - Url to send request
   * @param {object} data - Request data to send to the server
   */
  async put(url: string, data: Record<string, unknown>) {
    return this.makeRequest(url, "PUT", data);
  }

  /**
   * Send DELETE requesy to the server.
   *
   * @param {string} url - Url to send request
   * @param {object} data - Request data to send to the server
   */
  async delete(url: string, data: Record<string, unknown>) {
    return this.makeRequest(url, "DELETE", data);
  }

  /**
   * Send request to the server.
   *
   * @param {string} url - Url to make request to
   * @param {string} method - Http method
   * @param {string} data - Data to send to the server
   */
  async makeRequest(
    url: string,
    method: string,
    data: Record<string, unknown>
  ) {
    const config = getConfig();
    // Prepare request url by adding base url
    const requestUrl = `${config.baseUrl}${url}`;

    // Prepare authorization header
    const headers = {} as any;
    if (config.authToken && config.authToken !== null)
      headers.Authorization = `Bearer ${config.authToken}`;
    if (method !== "GET") headers["Content-Type"] = "application/json";

    // Add cors header
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";

    // Prepare request body
    const requestConfig = { method, headers, mode: "cors" } as any;
    if (method !== "GET") requestConfig.body = JSON.stringify(data);

    // Send request to the server
    return fetch(requestUrl, requestConfig).then((response) => response.json());
  }

  /**
   * Send authentication request to the server.
   * The server will return a token that will be used for
   * subsequent requests. The token will be stored in the
   * local storage and global variable(token).
   */
  async authenticate() {
    // return this.post('/auth/api-key/authenticate', {
    // 	apiKey: apiToken,
    // 	apiKeyPass: apiPassword
    // }).then((response) => {
    // 	if (!response.success) return null;
    // 	// If the response is successfull, store the token
    // 	// in the local storage and global variable(token)
    // 	token = response.token;
    // 	localStorage.setItem('token', token);
    // 	return token;
    // });
  }
}

export default new ApiClient();
