/* Docs-mode tools: fetch and search 8th Wall docs. */
import { z } from "zod";

const DEFAULT_DOCS_ROOT = process.env.EIGHTHWALL_DOCS_ROOT?.replace(/\/$/, "") ||
  "https://www.8thwall.com/docs";

function assertDocsUrl(url: string) {
  const root = new URL(DEFAULT_DOCS_ROOT);
  const u = new URL(url, root.origin);
  if (!u.href.startsWith(root.href)) {
    throw new Error(`URL not under docs root: ${DEFAULT_DOCS_ROOT}`);
  }
}

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const html = await res.text();
  // Naive HTML -> text sanitization. Replace with a robust parser if needed.
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
  return text;
}

export function registerDocsTools(server: any) {
  // docs.get_page
  server.tool(
    "docs_get_page",
    "Fetch a docs page and return plain text",
    { url: z.string() },
    async (args: any) => {
      if (typeof args.url !== "string") throw new Error("url must be string");
      assertDocsUrl(args.url);
      const text = await fetchPageText(args.url);
      return { content: [{ type: "text", text }] };
    }
  );

  // docs.search (naive multi-page keyword search)
  server.tool(
    "docs_search",
    "Search a small list of docs pages for a keyword (naive)",
    { query: z.string(), paths: z.array(z.string()) },
    async (args: any) => {
      const root = DEFAULT_DOCS_ROOT;
      const query = String(args.query || "").toLowerCase();
      const paths: string[] = Array.isArray(args.paths) ? args.paths : [];
      const hits: { url: string; count: number }[] = [];

      for (const p of paths) {
        const url = `${root.replace(/\/$/, "")}/${p.replace(/^\//, "")}`;
        try {
          assertDocsUrl(url);
          const text = await fetchPageText(url);
          const count = (text.toLowerCase().match(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
          if (count > 0) hits.push({ url, count });
        } catch (e) {
          // Skip on error; continue searching others
        }
      }

      hits.sort((a, b) => b.count - a.count);
      const summary = hits.map(h => `${h.url} (${h.count})`).join("\n");
      return { content: [{ type: "text", text: summary || "No matches." }] };
    }
  );
}
