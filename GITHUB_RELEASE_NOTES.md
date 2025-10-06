# 🎨 v0.2.5 - Three.js Script Generator

## New Feature: `desktop_add_threejs_script` Tool

Generate battle-tested Three.js scripts for 8th Wall Desktop AR experiences with a single command!

### 🎯 What's New

**New MCP Tool:** `mcp_8thwall_desktop_add_threejs_script`

Creates working Three.js scripts that:
- ✅ Integrate properly with 8th Wall Desktop ECS v2
- ✅ Handle XR8 pipeline initialization correctly
- ✅ Work perfectly in AR mode on mobile devices
- ✅ Include touch/click interaction support
- ✅ Position objects optimally for AR viewing
- ✅ Have comprehensive debugging logs

### 📦 Installation

Download the bundle: **`mcp-8thwall-Creator.mcpb`** (6.3 MB)

Add to your MCP configuration in Cursor:
```json
{
  "mcpServers": {
    "8thwall": {
      "command": "path/to/mcp-8thwall-Creator.mcpb"
    }
  }
}
```

### 🚀 Quick Start

```
You: Use mcp_8thwall_desktop_add_threejs_script to create 
     an interactive sphere that changes color when tapped

AI: ✅ Creates src/color-tap.js
    ✅ Updates .expanse.json
    ✅ Ready to test in AR!
```

### 🎮 Example: Interactive Color-Changing Sphere

Tested and working on actual mobile devices:
- Large, glowing sphere positioned 5m ahead
- Tap anywhere to cycle through colors
- Smooth rotation animation
- Proper 75° FOV for natural viewing
- Touch event handling with debugging

### ✨ Key Improvements

1. **Correct XR8 Integration**
   - Adds `XR8.Threejs.pipelineModule()` first
   - Uses Camera Pipeline Module pattern
   - Safe initialization in `onUpdate` callback

2. **Proper Scene Access**
   - Extracts scene/camera from `xrScene()` wrapper
   - Handles null checks and error cases
   - Names all objects to prevent crashes

3. **AR Optimizations**
   - Objects positioned 5 meters ahead (not too close!)
   - Eye-level placement (1.5m height)
   - 75° camera FOV for natural view
   - Touch events with capture phase

### 📚 Documentation

Included guides:
- **THREEJS_SCRIPT_GUIDE.md** - Complete usage guide
- **RELEASE-0.2.5.md** - Detailed release notes

### 🐛 Bug Fixes

- Fixed camera FOV settings for AR mode
- Improved touch event handling reliability
- Added comprehensive debug logging
- Corrected event propagation handling

### 🎓 Lessons Learned

This tool was developed after extensive debugging:
1. XR8.Threejs.pipelineModule() must be added first
2. xrScene() returns a wrapper - extract scene/camera
3. Initialize in onUpdate, check every frame
4. Name all Three.js objects to prevent errors
5. AR positioning requires careful distance/height

### 🙏 Tested On

- ✅ iPhone AR mode
- ✅ 8th Wall Desktop simulator
- ✅ Touch interactions
- ✅ Multiple objects in scene
- ✅ Color changing with animations

---

**Download the bundle and start creating amazing AR experiences!** 🚀✨

Report issues: https://github.com/superdwayne/8thwallmcp/issues

