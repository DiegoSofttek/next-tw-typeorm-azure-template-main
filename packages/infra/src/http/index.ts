export class HttpClient {
  static async post(url: string, body: any) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  static async get(url: string) {
    const response = await fetch(url);
    return response.json();
  }
}
