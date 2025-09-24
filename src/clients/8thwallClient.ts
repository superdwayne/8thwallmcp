/* Minimal 8th Wall HTTP client wrapper.
 * Fill in concrete endpoints for your environment.
 */

export type ClientConfig = {
  baseUrl: string; // e.g., https://api.8thwall.com/ or your internal gateway
  apiKey?: string; // bearer token or API key if required
};

export class EighthWallClient {
  private base: string;
  private apiKey?: string;

  constructor(cfg: ClientConfig) {
    this.base = cfg.baseUrl.replace(/\/$/, "");
    this.apiKey = cfg.apiKey;
  }

  private headers(): HeadersInit {
    const h: HeadersInit = {
      "content-type": "application/json"
    };
    if (this.apiKey) {
      // Update the header name/value according to your API’s scheme.
      h["authorization"] = `Bearer ${this.apiKey}`;
    }
    return h;
  }

  async get<T>(path: string): Promise<T> {
    const url = `${this.base}${path}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers()
    });
    if (!res.ok) {
      throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.base}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      throw new Error(`POST ${url} failed: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }
}

