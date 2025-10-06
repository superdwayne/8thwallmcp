# Release Notes: v0.2.9

## 🔥 CRITICAL FIX: A-Frame Components REMOVED

**Release Date:** October 6, 2025  
**Package:** `mcp-8thwall-0.2.9-no-aframe.mcpb`  
**Download:** [v0.2.9 Release](https://github.com/superdwayne/8thwallmcp/releases/tag/v0.2.9)

---

## 🚨 Breaking Changes

### Deleted Files
The following A-Frame component files have been **permanently removed**:
- ❌ `src/components/particleSystem.js`
- ❌ `src/components/audioController.js`
- ❌ `src/components/gestureHandler.js`
- ❌ `src/components/physicsHelper.js`

**Why?** These components were causing `ReferenceError: Can't find variable: AFRAME` errors in Desktop projects because **8th Wall Desktop uses Three.js directly, not A-Frame**.

---

## ✅ What's Fixed

### 1. **Zero AFRAME Errors**
- No more `ReferenceError: Can't find variable: AFRAME`
- No more `TypeError: null is not an object (evaluating 'scene.components')`
- No more webpack disconnection issues
- Desktop projects now **never** attempt to load A-Frame code

### 2. **Clear Tool Warnings**
Updated tool descriptions to prevent confusion:

**`desktop_add_custom_component`:**
```
⚠️ WEB PROJECTS ONLY - NOT FOR DESKTOP!
Add a custom A-Frame component for web-based 8th Wall projects
(requires index.html with A-Frame). Desktop projects (.expanse.json)
use Three.js directly - use desktop_add_threejs_script instead!
```

**`generate_custom_javascript`:**
```
⚠️ WEB PROJECTS ONLY - NOT FOR DESKTOP!
Generate A-Frame components for web-based projects.
For Desktop (.expanse.json), use desktop_add_threejs_script instead!
```

### 3. **Template Updates**
- `physics-playground` template no longer references deleted A-Frame components
- Updated to recommend Three.js physics libraries (Cannon.js, Ammo.js)
- All templates now clearly indicate Three.js usage

---

## 🛠️ Correct Tools for Desktop

### For Desktop Projects (.expanse.json):
✅ **USE:**
- `desktop_add_threejs_script` - Pure Three.js scripts
- `desktop_add_shape` - Geometry primitives
- `desktop_add_model` - 3D models
- `desktop_add_light` - Lighting
- `desktop_add_animation` - Animations

❌ **DON'T USE:**
- `desktop_add_custom_component` (A-Frame only)
- `generate_custom_javascript` (A-Frame templates)
- Any A-Frame related tools

### For Web Projects (index.html):
✅ **CAN USE:**
- A-Frame tools (if A-Frame is loaded in HTML)
- Three.js tools
- Both frameworks are supported for web projects

---

## 📊 Technical Details

### Root Cause
The MCP server had A-Frame component files in `src/components/` that were:
1. Being copied to Desktop projects via the template system
2. Being auto-imported by webpack configurations
3. Attempting to call `AFRAME.registerComponent()` when AFRAME didn't exist

### Solution
1. **Deleted** all A-Frame component source files from MCP server
2. **Updated** tool descriptions with clear warnings
3. **Modified** templates to use Three.js instead of A-Frame
4. **Documented** the correct approach in `DESKTOP_THREEJS_ONLY.md`

---

## 🎯 Migration Guide

### If You Had Previous Errors

**Before (v0.2.8 and earlier):**
```
ReferenceError: Can't find variable: AFRAME
    at ./src/components/particle-system.js
```

**After (v0.2.9):**
✅ No errors - A-Frame components no longer exist in the codebase

### If You Were Using A-Frame Components

**For Desktop Projects:**
- A-Frame doesn't work on Desktop
- Use `desktop_add_threejs_script` instead
- Write pure Three.js code

**For Web Projects:**
- A-Frame still fully supported
- Just add `<script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>` to your HTML
- Use A-Frame component generation tools

---

## 📚 Related Documentation

- [`DESKTOP_THREEJS_ONLY.md`](DESKTOP_THREEJS_ONLY.md) - Complete guide
- [`THREEJS_SCRIPT_GUIDE.md`](THREEJS_SCRIPT_GUIDE.md) - Three.js examples
- [`THREEJS_DEFAULT_MIGRATION.md`](THREEJS_DEFAULT_MIGRATION.md) - Migration info

---

## 🔄 Upgrade Instructions

1. **Download:** [mcp-8thwall-0.2.9-no-aframe.mcpb](https://github.com/superdwayne/8thwallmcp/releases/download/v0.2.9/mcp-8thwall-0.2.9-no-aframe.mcpb)
2. **Double-click** to install
3. **Restart** Claude Desktop
4. **Done!** No more AFRAME errors

---

## 🐛 Bug Reports

If you still experience issues:
1. Check you're using the correct tools for your project type
2. Verify Desktop projects use `.expanse.json` (not `index.html`)
3. Report at: https://github.com/superdwayne/8thwallmcp/issues

---

## 🙏 Credits

Thanks to **@dwayne** for identifying the root cause and testing the fix!

---

**Previous Release:** [v0.2.8](RELEASE-0.2.8.md)  
**Next Release:** TBD

