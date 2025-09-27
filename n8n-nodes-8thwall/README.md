8th Wall MCP — n8n Nodes

Custom n8n nodes to call the 8th Wall MCP HTTP bridge (from this repo).

Overview

- One flexible node: invoke any MCP tool exposed by the HTTP bridge
- Dynamic tool list loaded from `/tools`
- Simple credential: base URL of the bridge (default `http://127.0.0.1:8787`)

Prerequisites

- Run the MCP HTTP bridge from this repo in a separate process:
  - Build: `npm run build`
  - Start: `HTTP_PORT=8787 MODE=local PROJECT_ROOT=./project npm run http`

Install (as a local community package)

1) From `n8n-nodes-8thwall/` run:
   - `npm install`
   - `npm run build`
2) In n8n, enable community nodes and install from local folder or publish to npm as `n8n-nodes-8thwall`.

Usage

- Add credentials: 8th Wall MCP Bridge API
  - Base URL: `http://127.0.0.1:8787` (or your host/port)
- Add node: 8th Wall MCP Tool
  - Tool: pick from the dropdown (loads from `/tools`)
  - Args (JSON): parameters for the selected tool, e.g.
    - `assets_download_url`: `{ "url": "https://example.com/model.glb", "filename": "models/MyModel.glb" }`
    - `scene_add_gltf_model`: `{ "src": "assets/models/MyModel.glb", "position": [0,1.2,-2], "scale": [0.5,0.5,0.5] }`
    - `devserver_start`: `{ "port": 5173 }`

Notes

- The node simply POSTs to `/tool/<name>` with the JSON body you provide.
- Response shape mirrors the bridge: `{ ok, tool, result }`. The node outputs `result` (or the full body on error).
- To point at an 8th Wall Desktop project, set `PROJECT_ROOT` when starting the bridge, or use the desktop tools.

