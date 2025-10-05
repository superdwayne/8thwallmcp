# Release v0.1.0 - Desktop Extension Support 🎉

## One-Click Installation Now Available!

Install the 8th Wall MCP Server with just one click using the MCPB Desktop Extension format. No terminal commands, no configuration files needed!

**Download:** `mcp-8thwall-0.1.0.mcpb` (attached below)

---

## ✨ What's New

### 🔧 Critical Fixes

- **Fixed geometry rendering** - Cylinders and cones now display correctly with proper `heightSegments` and `openEnded` properties
- **Fixed color rendering** - Materials now use `basic` type instead of `standard` for reliable color display in 8th Wall Desktop
- **Fixed server crashes** - Proper process lifecycle management with keep-alive intervals

### 📦 Desktop Extension Support

- **MCPB 0.2 format** - Updated to latest Anthropic Desktop Extension specification
- **One-click install** - Package includes all dependencies (6.8MB, 1,722 files)
- **Automatic path resolution** - Uses `${__dirname}` for proper file loading after extraction

### 🚀 New Features

- **AR Portal support** - Create portals with hider/occluder materials (`colorWrite`, `depthWrite`, `depthTest`)
- **Image Target support** - Build image tracking experiences with `desktop_add_image_target`
- **Video texture support** - Add videos to AR scenes with custom JavaScript integration
- **Animation tools** - Rotation and scale animations for dynamic scenes
- **Model animations** - Control GLB/GLTF animation playback
- **Physics support** - Add physics to objects (dynamic, static, kinematic)

### 📚 Documentation

- **Modernized README** - Clean structure with badges, examples, and quick start guides
- **47 tools documented** - Organized into categories with expandable sections
- **Usage examples** - AR Beach Scene, Portal, Image Target workflows
- **Tips & best practices** - Guidance for common scenarios

---

## 🎯 47 Tools Available

### Project Management (12 tools)
- Project root management
- 8th Wall Desktop project discovery
- File operations (read, write, delete, move)
- Project scaffolding and export

### Scene Building (13 tools)
- Primitive shapes (box, sphere, cylinder, cone, etc.)
- 3D model loading (GLB/GLTF)
- Animations (rotation, scale, model playback)
- AR features (image targets, face tracking, video)
- JSON manipulation for advanced users

### Asset Management (8 tools)
- PolyHaven integration (search, categories, metadata)
- Asset downloads
- Archive extraction
- Asset strategy guidance

### Development (3 tools)
- Local preview server
- Health monitoring

### Web Scene Tools (11 tools)
- A-Frame and Three.js support
- Primitives, lights, models
- HDR environments
- Orbit controls and helpers

---

## 📥 Installation

### Option 1: One-Click Install (Recommended)

1. Download `mcp-8thwall-0.1.0.mcpb` (attached below)
2. Double-click to open with Claude Desktop
3. Click "Install" when prompted
4. Done! All 47 tools are ready

### Option 2: Manual Installation

See the [README](https://github.com/superdwayne/8thwallmcp#installation) for manual setup instructions.

---

## 🐛 Known Issues

- MCPB installation may require Claude Desktop restart
- Image target camera preview shows black in Desktop mode (test on phone)
- Video autoplay may require user interaction on some platforms

---

## 🔗 Links

- **Documentation**: [README](https://github.com/superdwayne/8thwallmcp#readme)
- **Report Issues**: [GitHub Issues](https://github.com/superdwayne/8thwallmcp/issues)
- **8th Wall Desktop**: https://www.8thwall.com/desktop/
- **MCP Protocol**: https://modelcontextprotocol.io/

---

## 🙏 Acknowledgments

Thanks to:
- **8th Wall** for their WebAR platform
- **Anthropic** for Claude and MCP
- **PolyHaven** for free 3D assets
- **The MCP Community** for inspiration

---

**Full Changelog**: https://github.com/superdwayne/8thwallmcp/commits/v0.1.0

