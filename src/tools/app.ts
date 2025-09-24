import { App } from "../types.js";
import { EighthWallClient } from "../clients/8thwallClient.js";
import { z } from "zod";

function mockApps(): App[] {
  return [
    {
      id: "app_123",
      name: "Sample AR App",
      description: "Mock app for development",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scenes: [
        { id: "scene_home", name: "Home" },
        { id: "scene_ar", name: "AR Experience" }
      ]
    }
  ];
}

export function registerAppTools(server: any) {
  const useMock = process.env.MOCK_8THWALL === "1";
  const apiBase = process.env.EIGHTHWALL_API_BASE || "";
  const apiKey = process.env.EIGHTHWALL_API_KEY;

  const client = new EighthWallClient({ baseUrl: apiBase || "http://localhost", apiKey });

  // app.list
  server.tool(
    "app_list",
    "List 8th Wall apps (mock unless API configured)",
    async () => {
      if (useMock || !apiBase) {
        const apps = mockApps();
        return { content: [{ type: "json", json: apps }] };
      }
      // Replace with real endpoint path when available
      const apps = await client.get<App[]>("/apps");
      return { content: [{ type: "json", json: apps }] };
    }
  );

  // app.get
  server.tool(
    "app_get",
    "Get a single app by ID (mock unless API configured)",
    { id: z.string() },
    async (args: any) => {
      const id = String(args.id);
      if (useMock || !apiBase) {
        const app = mockApps().find(a => a.id === id);
        if (!app) throw new Error("App not found (mock)");
        return { content: [{ type: "json", json: app }] };
      }
      // Replace with real endpoint path when available
      const app = await client.get<App>(`/apps/${encodeURIComponent(id)}`);
      return { content: [{ type: "json", json: app }] };
    }
  );
}
