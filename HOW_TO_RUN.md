# How to Run the MCP Server (Initial State)

## 🚀 **Quick Start**

### **1. Build the Server**

```bash
cd /Users/dwayne/Documents/Playground/mcp-8thwall
npm run build
```

### **2. Test It Works**

```bash
# Test stdio mode (MCP protocol)
node dist/index.js
```

You should see the server start. Press `Ctrl+C` to stop.

---

## 🔧 **Configure in Claude Desktop**

### **Step 1: Find Claude Config**

```bash
# macOS
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Or manually navigate to:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

### **Step 2: Add MCP Server Config**

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "8thwall": {
      "command": "node",
      "args": [
        "/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"
      ],
      "env": {
        "MODE": "local",
        "PROJECT_ROOT": "/Users/dwayne/Documents/8th Wall"
      }
    }
  }
}
```

**Important:** Use the full absolute path!

### **Step 3: Restart Claude Desktop**

1. Quit Claude Desktop completely
2. Reopen it
3. Start a new chat

---

## 🔧 **Configure in Cursor**

### **Step 1: Open Cursor MCP Settings**

1. Open Cursor
2. Go to Settings (⌘+,)
3. Search for "MCP"
4. Or edit directly: `~/.cursor/mcp.json`

### **Step 2: Add Configuration**

```json
{
  "mcpServers": {
    "8thwall": {
      "command": "node",
      "args": [
        "/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"
      ],
      "env": {
        "MODE": "local",
        "PROJECT_ROOT": "/Users/dwayne/Documents/8th Wall"
      }
    }
  }
}
```

### **Step 3: Restart Cursor**

1. Quit Cursor
2. Reopen it
3. The MCP server should be available

---

## ✅ **Verify It's Working**

### **In Claude Desktop:**

Ask:
```
List files in my 8th Wall project
```

Should show files from `/Users/dwayne/Documents/8th Wall`

### **In Cursor:**

Type `@` and you should see `8thwall` as an available context source.

---

## 🛠️ **Available Commands**

```bash
# Build TypeScript
npm run build

# Build and watch (for development)
npm run typecheck

# Run MCP server (stdio mode)
node dist/index.js

# Run HTTP mode (for testing)
npm run http
# Then access: http://127.0.0.1:8787/tools
```

---

## 📋 **Environment Variables**

Create a `.env` file (optional):

```env
# Mode: local | docs | api
MODE=local

# Local mode - your 8th Wall Desktop projects
PROJECT_ROOT=/Users/dwayne/Documents/8th Wall

# Docs mode (if using)
EIGHTHWALL_DOCS_ROOT=https://www.8thwall.com/docs/
EIGHTHWALL_BASE_URL=https://www.8thwall.com

# API mode (if using, requires API key)
EIGHTHWALL_API_BASE=https://api.8thwall.com
EIGHTHWALL_API_KEY=your-api-key-here
MOCK_8THWALL=1
```

**Note:** At this initial state, API mode is mocked.

---

## 🎯 **Test the Tools**

### **Test 1: List Files**

**In Claude:**
```
List files in the project
```

**Expected:** Shows files from your PROJECT_ROOT

### **Test 2: Read a File**

**In Claude:**
```
Read the .expanse.json file from adnight14 project
```

**Expected:** Shows the JSON content

### **Test 3: Add a Shape (Desktop Tools)**

**In Claude:**
```
Add a red sphere named "test-sphere" at position [0, 1, -3]
```

**Expected:** Creates object in `.expanse.json`

### **Test 4: Start Dev Server**

**In Claude:**
```
Start the dev server on port 5173
```

**Expected:** 
```
Dev server started at http://127.0.0.1:5173/
```

---

## 📦 **Available Tools (Initial State)**

### **Project Tools:**
- `project_get_info` - Show project structure
- `project_list_files` - List files
- `project_read_file` - Read a file
- `project_write_file` - Write a file
- `project_delete_file` - Delete a file
- `project_move_file` - Move/rename a file
- `project_scaffold` - Create basic project structure
- `project_export_zip` - Export project as ZIP

### **Desktop Tools (8th Wall Desktop .expanse.json):**
- `desktop_list_projects` - List 8th Wall Desktop projects
- `desktop_set_project` - Set active project
- `desktop_guess_scene` - Find .expanse.json files
- `desktop_read_json` - Read JSON with JSON Pointer support
- `desktop_write_json` - Write JSON
- `desktop_patch_json` - Patch JSON (set/remove/push/merge)
- `desktop_find_arrays` - Find arrays in JSON
- `desktop_add_shape` - Add shapes (box, sphere, cylinder, etc.)
- `desktop_enable_face_tracking` - Enable face tracking

### **Asset Tools:**
- `assets_status` - Check PolyHaven integration
- `assets_search_polyhaven` - Search PolyHaven assets
- `assets_polyhaven_categories` - List categories
- `assets_polyhaven_files` - Get file metadata
- `assets_download_url` - Download from URL
- `assets_unzip` - Unzip archives

### **Scene Tools (Web XR - A-Frame/Three.js):**
- `scene_detect_engine` - Detect A-Frame or Three.js
- `scene_add_gltf_model` - Add GLTF/GLB model
- `scene_set_background_color` - Set background color
- `scene_add_primitive` - Add primitive shapes
- `scene_add_light` - Add lights
- `scene_set_environment_hdr` - Set HDR environment
- `scene_add_animation` - Add animations
- `scene_add_textured_plane` - Add textured planes
- `scene_add_orbit_controls` - Add orbit controls
- `scene_add_grid_helper` - Add grid helper
- `scene_add_floor` - Add floor plane

### **Dev Server:**
- `devserver_start` - Start HTTP server
- `devserver_stop` - Stop HTTP server

### **Docs Tools:**
- `docs_get_page` - Fetch 8th Wall docs
- `docs_search` - Search docs

---

## ⚠️ **Known Limitations (Initial State)**

### **No Auto-Protection:**
- ❌ No automatic `components: {}` initialization
- ❌ No auto-repair when reading `.expanse.json`
- ❌ No component validation

**Workaround:** Manually ensure objects have `components: {}`

### **Limited Geometry Support:**
- ⚠️ Some geometry types may not work
- ⚠️ Material defaults may cause errors

**Workaround:** Test shapes in Desktop first

### **No Helper Scripts:**
- ❌ No `check-components.sh`
- ❌ No `clean-components.sh`

**Workaround:** Manually validate JSON files

---

## 🐛 **Troubleshooting**

### **Server Not Starting:**

```bash
# Check if built
ls dist/index.js

# If not, build it
npm run build

# Try running directly
node dist/index.js
```

### **Claude Can't Find Server:**

1. Check config path is absolute:
   ```json
   "args": ["/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"]
   ```

2. Restart Claude Desktop completely

3. Check logs:
   ```bash
   # macOS
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

### **"Invalid component" Errors:**

**This version doesn't auto-protect!**

Quick fix:
```python
import json

path = '/Users/dwayne/Documents/8th Wall/project/src/.expanse.json'
with open(path, 'r') as f:
    data = json.load(f)

for obj in data.get('objects', {}).values():
    if 'components' not in obj:
        obj['components'] = {}

with open(path, 'w') as f:
    json.dump(data, f, indent=2)
```

Or restore the fix:
```bash
git checkout backup-production-ready-20251001-141841 -- src/tools/desktop.ts
npm run build
```

---

## 🔄 **Development Workflow**

### **1. Make Changes**

Edit files in `src/`:
```bash
vim src/tools/desktop.ts
```

### **2. Build**

```bash
npm run build
```

### **3. Test**

```bash
# Restart Claude Desktop to reload server
# Then test in Claude
```

### **4. Type Check**

```bash
npm run typecheck
```

---

## 📊 **Project Structure**

```
mcp-8thwall/
├── src/
│   ├── index.ts           # Main entry point
│   ├── http.ts            # HTTP bridge
│   ├── types.ts           # TypeScript types
│   ├── clients/
│   │   └── 8thwallClient.ts
│   └── tools/
│       ├── app.ts         # API tools (mocked)
│       ├── assets.ts      # Asset management
│       ├── desktop.ts     # 8th Wall Desktop tools
│       ├── devserver.ts   # Dev server
│       ├── docs.ts        # Docs tools
│       ├── project.ts     # Project file ops
│       ├── prompts.ts     # Strategy guidance
│       └── scene.ts       # Web XR scene tools
├── dist/                  # Built JavaScript
├── project/               # Example project
├── scripts/
│   └── devserver.mjs     # Dev server implementation
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 **Example Usage**

### **Scenario 1: Working with Existing Project**

```
You: Set project root to adnight14
Assistant: [Uses desktop_set_project]

You: Show me all objects in the scene
Assistant: [Uses desktop_read_json with pointer /objects]

You: Add a green sphere at [2, 1, -4]
Assistant: [Uses desktop_add_shape]

You: Start dev server
Assistant: [Uses devserver_start]
```

### **Scenario 2: Creating New Project**

```
You: Create a new A-Frame project in ~/Documents/8th Wall/my-game
Assistant: [Uses project_scaffold with template=aframe]

You: Add a blue box and red sphere
Assistant: [Uses scene_add_primitive twice]

You: Add a directional light
Assistant: [Uses scene_add_light]

You: Start dev server
Assistant: [Uses devserver_start]
```

---

## ✅ **Quick Reference**

| Task | Command |
|------|---------|
| **Build** | `npm run build` |
| **Type check** | `npm run typecheck` |
| **Run MCP** | `node dist/index.js` |
| **Run HTTP** | `npm run http` |
| **Test in Claude** | Ask "List files in project" |
| **View logs** | `tail -f ~/Library/Logs/Claude/mcp*.log` |

---

## 🆘 **Need the Improvements Back?**

```bash
# See what was removed
cat REVERT_INFO.md

# Restore everything
git checkout backup-production-ready-20251001-141841
npm run build

# Restore just component fixes
git checkout backup-production-ready-20251001-141841 -- src/tools/desktop.ts
npm run build
```

---

## 📞 **Support**

- Check `README.md` for detailed info
- See `REVERT_INFO.md` for what was removed
- View logs: `~/Library/Logs/Claude/mcp*.log` (macOS)

---

**You're ready to use the MCP server!** 🚀

Start by asking Claude: "List files in my 8th Wall project"


