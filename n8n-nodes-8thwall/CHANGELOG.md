# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 — 2025-09-27

Initial stable release of n8n-nodes-8thwall.

- Single flexible node: “8th Wall MCP Tool” to call any MCP HTTP bridge tool
- Dynamic tool list from `GET /tools`
- Arguments passed as JSON to `POST /tool/<name>`
- Uses n8n `httpRequest` helper; supports `continueOnFail`
- Credential: “8th Wall MCP Bridge API” with Test request (`GET /tools`)
- Build: TypeScript compile + asset copy (SVG icon) on prepack
- Packaging: files whitelist (`dist`, `README.md`), public publish config
