# 8th Wall MCP Server

> Build WebAR experiences with natural language using Claude Desktop and 8th Wall Desktop

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

## 🚀 One-Click Install

**Download the latest version:**

[![Download AR Creator](https://img.shields.io/badge/Download-AR%20Creator-purple?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMNCAyMEgxMkgyMEwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)](https://github.com/superdwayne/8thwallmcp/releases/download/v0.2.11/mcp-8thwall-0.2.11-fov-fix.mcpb)

**📦 6.3 MB** • **🎨 Pure Three.js** • **📱 AR-Tested** • **🐛 Bug Fixes**

**Double-click to install!** No terminal commands, no configuration files.

---

## ✨ What's New

### Latest Updates (v0.2.10) 🐛

**FIXED: ECS ATTRIBUTE ERRORS**

- 🐛 **Fixed "No attribute registered" Error** - Disabled broken animation tools
- ❌ **Broken Tools Removed** - `desktop_add_rotation_animation` and `desktop_add_scale_animation` disabled
- ✅ **Use Three.js Animations** - All animations now use `desktop_add_threejs_script`
- 🎯 **No More Runtime Errors** - Zero ECS attribute errors in Desktop projects
- 📝 **Helpful Error Messages** - Broken tools now guide you to the correct approach
- 🚀 **Stable & Reliable** - All working tools tested and verified

### Previous Updates (v0.2.9) 🔥

**A-FRAME COMPONENTS COMPLETELY REMOVED**

- 🗑️ **Deleted All A-Frame Components** - Removed particleSystem.js, audioController.js, gestureHandler.js, physicsHelper.js
- ✅ **No More AFRAME Errors** - Zero chance of "Can't find variable: AFRAME" errors
- ⚠️ **Clear Tool Warnings** - A-Frame tools now clearly marked as "WEB PROJECTS ONLY"

### Previous Updates (v0.2.8) 📚

**Documentation Clarity**

- 🎯 **Documentation Added** - Clear explanation: Desktop = Three.js, NOT A-Frame
- ✅ **No More Confusion** - A-Frame is only for web projects, not Desktop
- 📚 **DESKTOP_THREEJS_ONLY.md** - Complete guide to proper Desktop development
- 🛠️ **Right Tools** - Use `desktop_add_threejs_script` for Desktop projects

### Previous Updates (v0.2.7) 🛡️

**AFRAME Safety Checks** (for web projects only)

- 🛡️ **Safe AFRAME Registration** - All components now check for AFRAME before registering
- ⏱️ **Load Event Waiting** - Components wait for window 'load' event before initialization
- 🐛 **Zero Runtime Errors** - Eliminated "Can't find variable: AFRAME" errors
- 📝 **Comprehensive Logging** - Detailed console messages for debugging
- ✅ **Graceful Fallback** - Helpful error messages guide users to add A-Frame if needed
- 🔄 **Webpack HMR Compatible** - No more disconnection issues

### Previous Updates (v0.2.6) 🚀

**Three.js is Now the Default Framework!**

- 🎯 **Three.js Default** - All new projects now default to Three.js instead of A-Frame
- 🐛 **Mobile Fixes** - Eliminated A-Frame loading errors on mobile devices
- ✅ **Better Compatibility** - Improved mobile browser support with pure Three.js
- 🔄 **Auto-Fallback** - Scene tools automatically use Three.js when engine is unknown
- 📚 **Full Documentation** - Comprehensive migration guide and updated templates
- ⚡ **No Breaking Changes** - A-Frame still supported via explicit template parameter

### Previous Updates (v0.2.5) 🎨

**Three.js Script Generator**

- 🎯 **`desktop_add_threejs_script`** - Generate battle-tested Three.js scripts for AR interactions
- ✅ **Proper XR8 Integration** - Handles pipeline initialization, scene access, and camera setup correctly
- 📱 **AR-Tested** - Works perfectly on mobile devices with touch/click interactions
- 🎨 **Interactive Objects** - Creates tap-to-change-color spheres, particle systems, and more
- 📍 **Optimal Positioning** - Places objects 5m ahead at eye level with proper FOV
- 🐛 **Comprehensive Logging** - Detailed debugging output for troubleshooting
- 📦 **6.3 MB** - Includes all dependencies and templates

### Previous Updates (v0.2.4)

- 🤖 **AI-Powered AR Creation** - Create complete AR experiences from natural language
- 🎨 **6 Experience Templates** - Light painting, model showcase, portals, face filters
- 💻 **Code Generation** - Generate custom JavaScript components
- 🧩 **Custom Components** - Add and manage A-Frame components
- 🔍 **Unified Asset Discovery** - Search PolyHaven assets with recommendations
- 🎯 **Smart Orchestration** - Analyzes requests and chains tools automatically

## 🎯 Features

### 🛠️ **66+ Tools for Advanced AR Development**

#### 🤖 AI-Powered Creation (NEW!)
- **Smart Orchestration** - `create_ar_experience` - Build complete AR experiences from descriptions
- **Pattern Recognition** - Automatically identifies AR experience types (face tracking, image targets, etc.)
- **Code Generation** - Generate custom JavaScript from natural language
- **Experience Templates** - 6 pre-built templates (light painting, portals, face filters, etc.)

#### 🧩 Custom Development (NEW!)
- **Custom Components** - Add and manage A-Frame components
- **Asset Discovery** - Search PolyHaven with smart recommendations
- **Code Templates** - Pre-built particle systems, gesture handlers, audio controllers
- **JavaScript Validation** - Check code for errors before deployment

#### 🎨 Scene Building
- **Desktop Scene Building** - Add shapes, models, lights, and animations
- **AR Features** - Image targets, face tracking, world tracking
- **Animation System** - Rotation, scale, and model animations
- **Physics** - Add physics to objects (dynamics, mass, gravity)

#### 📦 Asset & Project Management
- **Asset Management** - Search PolyHaven, download models, manage files
- **Project Tools** - Create, edit, and manage 8th Wall Desktop projects
- **Dev Server** - Built-in preview server for testing

### 🎨 **Natural Language Scene Building**

```
"Create a spinning red cube with a metallic sphere orbiting around it"
"Add a beach ball with physics that falls when the scene starts"
"Create an AR portal using hider materials"
"Add an image target experience with a video"
```

### 🔧 **Three Operation Modes**

1. **Local Mode** (Default) - Work with 8th Wall Desktop projects locally
2. **Docs Mode** - Access 8th Wall documentation
3. **API Mode** - Integrate with 8th Wall Cloud (requires API key)

---

## 📦 Installation

### Option 1: One-Click Install (Recommended)

1. **Download** the [mcp-8thwall-0.1.0.mcpb](https://github.com/superdwayne/8thwallmcp/releases/latest/download/mcp-8thwall-0.1.0.mcpb) file
2. **Double-click** to open with Claude Desktop
3. **Click Install** when prompted
4. **Done!** All 47 tools are now available

### Option 2: Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/superdwayne/8thwallmcp.git
   cd mcp-8thwall
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Add to Claude Desktop config** (`~/.claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
       "mcp-8thwall": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-8thwall/dist/index.js"
      ]
    }
  }
}
```

5. **Restart Claude Desktop**

---

## 🎮 Quick Start

### Create Your First AR Scene

1. **Set your project:**
   ```
   "Set my project to my-ar-project"
   ```

2. **Add 3D content:**
   ```
   "Create a red spinning cube at position (0, 1, -2)"
   ```

3. **Add animations:**
   ```
   "Make the cube pulse between 80% and 120% size"
   ```

4. **Add AR features:**
   ```
   "Enable face tracking with a debug mesh"
   ```

### Work with 8th Wall Desktop

```
"List all my 8th Wall Desktop projects"
"Set project to beach-scene"
"Add a seagull GLB model from assets at position (0, 2, 0)"
"Add physics to the beach ball"
"Make the rocket orbit the planet"
```

### Search for Assets

```
"Search PolyHaven for space textures"
"Download the damaged helmet GLB"
"Add the downloaded model at position (0, 1.5, -3)"
```

---

## 🔧 Desktop Scene Building Tools

### Primitives & Shapes

- `desktop_add_shape` - Add 3D primitives:
  - **Geometries**: box, sphere, cylinder, cone, plane, circle, torus, ring
  - **Materials**: basic, standard, phong
  - **Properties**: color, roughness, metalness, opacity, emissive
  - **Hider materials**: colorWrite, depthWrite, depthTest (for AR portals)

### 3D Models

- `desktop_add_model` - Add GLB/GLTF models:
  - Load from `assets/` folder
  - Position, rotation, scale
  - Animation playback
  - Physics support (static, dynamic, kinematic)

### Animations

- `desktop_add_rotation_animation` - Spin objects:
  - Axis selection (X, Y, Z)
  - Speed control
  - Loop and reverse options
  - Easing functions

- `desktop_add_scale_animation` - Pulse/breathe effects:
  - Min/max scale
  - Duration control
  - Loop and reverse
  - Easing functions

- `desktop_set_model_animation` - Control model animations:
  - Play specific animation clips
  - Loop control
  - Playback speed

### AR Features

- `desktop_enable_face_tracking` - Face AR experiences
- `desktop_add_image_target` - Image tracking
- `desktop_add_video` - Video textures
- Hider materials for AR portals

---

## 📚 Documentation

### Tool Categories

<details>
<summary><b>Project Management (12 tools)</b></summary>

- `project_get_root` / `project_set_root` - Manage project directory
- `desktop_list_projects` / `desktop_set_project` - 8th Wall Desktop projects
- `project_get_info` - Get project structure
- `project_list_files` - List files
- `project_read_file` / `project_write_file` - File operations
- `project_delete_file` / `project_move_file` - File management
- `project_scaffold` - Create new project
- `project_export_zip` - Export for upload

</details>

<details>
<summary><b>Scene Building (13 tools)</b></summary>

- `desktop_add_shape` - Primitives (box, sphere, etc.)
- `desktop_add_model` - GLB/GLTF models
- `desktop_add_rotation_animation` - Spin objects
- `desktop_add_scale_animation` - Pulse effects
- `desktop_add_image_target` - Image tracking
- `desktop_add_video` - Video textures
- `desktop_enable_face_tracking` - Face AR
- `desktop_set_model_animation` - Model animations
- `desktop_read_json` / `desktop_write_json` / `desktop_patch_json` - JSON manipulation
- `desktop_guess_scene` - Find scene files

</details>

<details>
<summary><b>Asset Management (8 tools)</b></summary>

- `assets_status` - Check PolyHaven availability
- `assets_search_polyhaven` - Search assets
- `assets_polyhaven_categories` - Browse categories
- `assets_polyhaven_files` - Get asset metadata
- `assets_download_url` - Download files
- `assets_unzip` - Extract archives
- `prompts_asset_strategy` - Asset guidance

</details>

<details>
<summary><b>Development Tools (3 tools)</b></summary>

- `devserver_start` / `devserver_stop` - Local preview
- `health_ping` - Health check

</details>

<details>
<summary><b>Web Scene Tools (11 tools)</b></summary>

For A-Frame and Three.js projects:
- `scene_detect_engine` - Detect A-Frame or Three.js
- `scene_add_gltf_model` - Add models
- `scene_set_background_color` - Background
- `scene_add_primitive` - Primitives
- `scene_add_light` - Lighting
- `scene_set_environment_hdr` - HDR environment
- `scene_add_animation` - Animations
- `scene_add_textured_plane` - Image planes
- `scene_add_orbit_controls` - Three.js controls
- `scene_add_grid_helper` / `scene_add_floor` - Helpers

</details>

<details>
<summary><b>Documentation (2 tools)</b></summary>

- `docs_get_page` - Fetch documentation
- `docs_search` - Search docs

</details>

---

## 🐛 Known Issues & Fixes

### ✅ Fixed in v0.1.0

- **Geometry Properties Error** - Fixed missing `heightSegments` and `openEnded` properties for cylinders and cones
- **Color Rendering Issue** - Materials now use `basic` type instead of `standard` for reliable color rendering
- **Server Crashes** - Fixed process lifecycle management with proper keep-alive intervals

### Current Limitations

- MCPB auto-installation may require Claude Desktop restart
- Image target camera preview shows black in Desktop mode (test on phone)
- Video autoplay may require user interaction on some platforms

---

## 🏗️ Project Structure

```
mcp-8thwall/
├── src/
│   ├── index.ts              # Server entry point
│   ├── tools/
│   │   ├── desktop.ts        # 8th Wall Desktop tools
│   │   ├── scene.ts          # Web scene tools
│   │   ├── project.ts        # Project management
│   │   ├── assets.ts         # Asset tools
│   │   ├── devserver.ts      # Dev server
│   │   └── docs.ts           # Documentation tools
│   ├── clients/
│   │   └── 8thwallClient.ts  # API client
│   └── utils/
│       └── projectRoot.ts    # Project root management
├── dist/                     # Compiled JavaScript
├── manifest.json             # MCPB manifest
├── mcp-8thwall-0.1.0.mcpb   # Desktop Extension package
└── README.md                 # This file
```

---

## 🚀 Advanced Usage

### Environment Variables

```json
{
  "mcpServers": {
    "mcp-8thwall": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "MODE": "local",
        "PROJECT_ROOT": "/path/to/your/project",
        "EIGHTHWALL_DESKTOP_ROOT": "~/Documents/8th Wall"
      }
    }
  }
}
```

**Available Modes:**
- `local` (default) - Work with local 8th Wall Desktop projects
- `docs` - Access 8th Wall documentation
- `api` - Integrate with 8th Wall Cloud API

### HTTP Bridge for n8n

Run an HTTP bridge to call tools from n8n or other automation platforms:

```bash
HTTP_PORT=8787 MODE=local PROJECT_ROOT=./project npm run http
```

**API Endpoints:**
- `GET http://localhost:8787/tools` - List all tools
- `POST http://localhost:8787/tool/<toolName>` - Invoke a tool

### Development

```bash
npm run dev          # Run with ts-node
npm run build        # Compile TypeScript
npm run typecheck    # Type checking only
npm run pack:dxt     # Create MCPB package
```

---

## 📖 Examples

### Create an AR Beach Scene

```
1. "Set project to beach-scene"
2. "Add a blue sphere for the sky at (0, 50, 0) with radius 100"
3. "Add a sandy plane as the ground at (0, 0, 0)"
4. "Download a seagull GLB and add it flying at (2, 5, -10)"
5. "Make the seagull rotate slowly on the Y axis"
6. "Add a beach ball with physics at (0, 2, -3)"
```

### Create an AR Portal

```
1. "Set project to portal-demo"
2. "Create a portal using hider materials"
3. "Add a rotating torus as the portal ring"
4. "Add a blue emissive sphere as the portal glow"
5. "Make the glow pulse between 80% and 120%"
```

### Image Target Experience

```
1. "Set project to image-target-demo"
2. "Add an image target for 'poster.jpg'"
3. "Add a video plane with 'promo-video.mp4'"
4. "Add a GLB model that appears on the image"
5. "Make the model spin on the Y axis"
```

---

## 🤝 Contributing

Contributions are welcome! Please see:
- [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our code of conduct
- [SECURITY.md](SECURITY.md) for security reporting

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run typecheck`
6. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🔗 Links

- **8th Wall Desktop**: [8thwall.com/desktop](https://www.8thwall.com/desktop/)
- **Model Context Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- **Claude Desktop**: [claude.ai](https://claude.ai/)
- **PolyHaven Assets**: [polyhaven.com](https://polyhaven.com/)
- **GitHub Issues**: [Report a bug](https://github.com/superdwayne/8thwallmcp/issues)

---

## 💡 Tips

- Use `desktop_list_projects` to discover your 8th Wall Desktop projects
- Search PolyHaven for free 3D assets, textures, and HDRIs
- Test AR features on a phone for camera preview
- Use hider materials (`colorWrite: false`) for AR portal effects
- Enable physics for dynamic objects
- Use animations to bring your scenes to life

---

## 🙏 Acknowledgments

- **8th Wall** for their amazing WebAR platform
- **Anthropic** for Claude and the MCP protocol
- **PolyHaven** for free 3D assets
- **The MCP Community** for tools and inspiration

---

**Built with ❤️ by [Dwayne Paisley-Marshall](https://github.com/superdwayne)**
