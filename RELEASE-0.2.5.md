# MCP 8th Wall v0.2.5 - Three.js Script Generator 🎨

## 🎉 New Feature: `desktop_add_threejs_script`

This release adds a powerful new tool for generating working Three.js scripts for 8th Wall Desktop projects.

## ✨ What's New

### New MCP Tool: `mcp_8thwall_desktop_add_threejs_script`

Generates battle-tested Three.js scripts that integrate perfectly with 8th Wall Desktop ECS v2.

**Parameters:**
- `scriptName` (required): Name for the script file
- `scriptType` (optional): Type of script to generate
  - `"particle-system"` - Creates a particle system like light painting
  - `"interactive-object"` - Creates tap-to-interact objects (default)
  - `"custom"` - Generates a minimal template

**Example Usage:**
```
Use mcp_8thwall_desktop_add_threejs_script with:
- scriptName: "color-tap"
- scriptType: "interactive-object"
```

## 🔧 What The Tool Generates

All generated scripts include:

### ✅ Proper 8th Wall Desktop Integration
- Waits for `xrloaded` event
- Adds `XR8.Threejs.pipelineModule()` first (critical!)
- Uses Camera Pipeline Module pattern
- Safe initialization in `onUpdate` callback

### ✅ Correct Three.js Access
- Calls `XR8.Threejs.xrScene()` to get wrapper object
- Extracts `scene` and `camera` from wrapper correctly
- Handles null checks and error cases

### ✅ Best Practices
- Names all Three.js objects (prevents inspector crashes)
- Includes comprehensive console logging for debugging
- Uses proper event handling for touch/click
- Positioned correctly for AR viewing (5m ahead, eye level)

## 📚 Lessons Learned & Implemented

This tool was developed after extensive debugging of AR projects. Key discoveries:

1. **XR8.Threejs.pipelineModule() is required** - Must be added before custom modules
2. **xrScene() returns a wrapper** - Contains `.scene`, `.camera`, `.renderer` properties
3. **Extract the actual objects** - Don't use the wrapper directly (`wrapper.scene`, not `wrapper`)
4. **Initialize in onUpdate** - Check every frame until scene/camera are ready
5. **Name everything** - Prevents "Cannot read properties of undefined (reading 'split')" errors
6. **AR positioning matters** - Objects need to be far enough away and at proper height

## 🎮 Tested Scenarios

- ✅ AR phone view (tested on mobile)
- ✅ Desktop simulator
- ✅ Touch/click interaction
- ✅ Color changing with animations
- ✅ Proper FOV settings (75°)
- ✅ Multiple objects in scene
- ✅ Continuous rotation animations

## 📦 Bundle Details

**File:** `mcp-8thwall-0.2.5-threejs.mcpb`  
**Size:** 6.3 MB  
**Date:** October 5, 2025

## 🚀 How to Use

### 1. Install the Bundle
```bash
# In Cursor settings, add the .mcpb file
```

### 2. Restart Cursor
The MCP server needs to restart to pick up the new tool.

### 3. Generate a Script
```
You: Use mcp_8thwall_desktop_add_threejs_script to create an interactive sphere that changes color when tapped

AI: [Creates src/color-tap.js with working code]
     [Updates .expanse.json to load the script]
```

### 4. Test in 8th Wall Desktop
Open your project and play - the generated code works out of the box!

## 📄 New Documentation

- **THREEJS_SCRIPT_GUIDE.md** - Complete guide to using the tool
- Includes code patterns, examples, and debugging tips

## 🐛 Fixes & Improvements

- Camera FOV now properly set to 75° for AR
- Touch events use capture phase for reliability
- Comprehensive debug logging added
- Event propagation properly handled

## 💡 Example Projects Included

The tool was developed and tested with:
- **color-tap-test.js** - Interactive color-changing sphere
- **simple-sphere.js** - Basic Three.js object creation
- Both work perfectly in AR mode on actual phones!

## 🎯 What's Next

Future enhancements could include:
- Particle system templates
- Physics integration helpers
- Model loading scripts
- Animation sequence generators

---

**Ready to create amazing AR experiences with confidence!** 🎨✨

