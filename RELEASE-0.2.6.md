# Release Notes - v0.2.6: Three.js Default

## 🚀 Major Changes

### Three.js is Now the Default Framework
All new projects now default to **Three.js** instead of A-Frame. This change addresses mobile browser compatibility issues and provides better control over WebGL rendering.

**Why This Change?**
- ❌ A-Frame dependency failures caused runtime errors on mobile devices
- ❌ Errors like `ReferenceError: Can't find variable: AFRAME` and `TypeError: null is not an object (evaluating 'scene.components')`
- ✅ Three.js provides direct WebGL control with better mobile browser support
- ✅ Eliminates extra dependency layer that can fail
- ✅ Better debugging and error handling

## 📦 What's Changed

### 1. **Default Scaffold Template**
```javascript
// Before v0.2.6
project_scaffold() // Created A-Frame project

// After v0.2.6
project_scaffold() // Creates Three.js project by default
```

Projects scaffolded without specifying a template now use Three.js with:
- Modern ES6 module imports from CDN
- Three.js scene, camera, and renderer setup
- WebXR/VR support with VRButton
- Responsive canvas handling

### 2. **Scene Tools Auto-Detection**
All scene manipulation tools now default to Three.js when engine type is unknown:
- ✅ `scene_add_gltf_model` - Uses GLTFLoader
- ✅ `scene_set_background_color` - Sets THREE.Color
- ✅ `scene_add_primitive` - Creates THREE geometry
- ✅ `scene_add_light` - Adds THREE lights
- ✅ `scene_set_environment_hdr` - Uses RGBELoader
- ✅ `scene_add_animation` - Animates THREE meshes
- ✅ `scene_add_textured_plane` - Creates textured planes

### 3. **Updated Templates**
The `light-painting` template has been rewritten to use Three.js:
- Particle system using `THREE.Points` and `THREE.BufferGeometry`
- Touch/mouse event handling with raycasting
- Dynamic vertex color updates
- No A-Frame component dependencies

## 🔄 Backward Compatibility

### A-Frame Still Supported
A-Frame is **not removed**, just no longer the default:

```javascript
// Explicitly request A-Frame
project_scaffold({ template: "aframe" })
```

### Existing Projects
- No breaking changes for existing projects
- Projects using Three.js continue to work
- Projects using A-Frame continue to work
- Detection logic still recognizes both frameworks

## 📋 Installation & Usage

### Download & Install
1. Download `mcp-8thwall-0.2.6-threejs-default.mcpb`
2. Install in your MCP client (Claude Desktop, Cline, etc.)

### Configuration (Claude Desktop)
```json
{
  "mcpServers": {
    "mcp-8thwall": {
      "command": "node",
      "args": ["/path/to/mcp-8thwall-0.2.6-threejs-default.mcpb/dist/index.js"]
    }
  }
}
```

### Quick Start
```javascript
// 1. Create a new Three.js project
project_scaffold()

// 2. Add a 3D model
scene_add_gltf_model({ 
  src: "assets/model.glb",
  position: [0, 0, -2]
})

// 3. Add lighting
scene_add_light({ 
  kind: "hemisphere",
  intensity: 1.0
})

// 4. Start dev server
devserver_start({ port: 8080 })
```

## 🐛 Bug Fixes

- ✅ Fixed: `ReferenceError: Can't find variable: AFRAME` on mobile devices
- ✅ Fixed: `TypeError: null is not an object (evaluating 'scene.components')`
- ✅ Fixed: A-Frame CDN loading failures causing blank screens
- ✅ Improved: Error handling in scene manipulation tools
- ✅ Enhanced: Mobile browser compatibility

## 📚 Documentation

New documentation added:
- `THREEJS_DEFAULT_MIGRATION.md` - Complete migration guide
- Updated `THREEJS_SCRIPT_GUIDE.md` - Three.js best practices
- Updated `README.md` - Reflects Three.js as default

## ⚠️ Breaking Changes

**None!** This is a non-breaking change:
- Existing projects continue to work unchanged
- A-Frame can still be explicitly requested
- All existing tools and APIs remain compatible

## 🔍 Technical Details

### Files Modified
- `src/tools/project.ts` - Default template changed to "three"
- `src/tools/scene.ts` - Added Three.js fallback for unknown engines (7 functions)
- `src/tools/templates.ts` - Updated light-painting template to Three.js

### Compiled Output
All changes compiled to `dist/` directory:
- `dist/tools/project.js` - Line 252
- `dist/tools/scene.js` - Lines 104, 135, 170, 230, 271, 306, 339

## 🎯 Next Steps

After installing v0.2.6:

1. **Test on Mobile Device**
   - Create a project with `project_scaffold()`
   - Test on actual mobile browser
   - Verify no A-Frame errors appear

2. **Migrate Existing Projects** (Optional)
   - A-Frame projects still work as-is
   - To migrate to Three.js, see `THREEJS_DEFAULT_MIGRATION.md`

3. **Explore Three.js Features**
   - Better control over rendering
   - More efficient particle systems
   - Advanced shader capabilities
   - Lower-level WebGL access

## 💬 Feedback & Issues

- **Report Issues**: [GitHub Issues](https://github.com/superdwayne/8thwallmcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/superdwayne/8thwallmcp/discussions)
- **Documentation**: [README.md](https://github.com/superdwayne/8thwallmcp)

## 🙏 Credits

Special thanks to users who reported the A-Frame mobile errors that prompted this improvement!

---

**Full Changelog**: [v0.2.4...v0.2.6](https://github.com/superdwayne/8thwallmcp/compare/v0.2.4...v0.2.6)

**Download**: `mcp-8thwall-0.2.6-threejs-default.mcpb` (6.3MB)

**SHA256**: `d86f82aa10c3c155129b5957fce4ff9d55d2d9bf`

---

### Installation Size
- Package: **6.3MB** (compressed)
- Unpacked: **26.7MB**
- Files: **1,370** (326 included after .dxtignore)

### Requirements
- Node.js >= 18
- MCP SDK >= 1.2.0

**Released**: October 6, 2025  
**Maintainer**: Dwayne Paisley-Marshall

