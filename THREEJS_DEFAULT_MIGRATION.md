# Migration to Three.js as Default Framework

## Summary
The MCP 8th Wall server has been updated to **always use Three.js/JavaScript** instead of A-Frame by default. This change addresses runtime errors that occur when A-Frame isn't loading properly on mobile devices.

## Changes Made

### 1. **Default Scaffold Template** (`src/tools/project.ts`)
- **Before**: Default template was `"aframe"`
- **After**: Default template is now `"three"`
- **Line 319**: `const tmpl = (args?.template || "three") as "aframe" | "three";`

This ensures that when scaffolding a new project without specifying a template, it will use Three.js instead of A-Frame.

### 2. **Scene Tools Default Engine** (`src/tools/scene.ts`)
All scene manipulation tools now default to Three.js when the engine type is unknown or cannot be detected.

**Updated Functions** (7 total):
- `scene_add_gltf_model` (line 117-119)
- `scene_set_background_color` (line 157-159)
- `scene_add_primitive` (line 197-199)
- `scene_add_light` (line 257-259)
- `scene_set_environment_hdr` (line 302-304)
- `scene_add_animation` (line 345-347)
- `scene_add_textured_plane` (line 385-387)

Each function now includes:
```typescript
let engine = detectEngineFromIndexHtml(html);
// Default to Three.js if engine is unknown
if (engine === "unknown") engine = "three";
```

### 3. **Template System** (`src/tools/templates.ts`)
Updated the `light-painting` template to use Three.js instead of A-Frame:
- **Before**: Used A-Frame components (`a-scene`, `scene.components`)
- **After**: Uses Three.js with `THREE.Points`, `THREE.BufferGeometry`, and proper particle system
- **Components**: Removed dependency on A-Frame components

**Template Guidance Updated**:
- Removed references to `<a-scene>` components
- Added guidance to use `project_scaffold` with `template: "three"`
- Updated instructions to work with Three.js scene, camera, and renderer

## Why This Change?

### Problems with A-Frame:
1. **Runtime Errors**: When A-Frame library fails to load, you get errors like:
   - `ReferenceError: Can't find variable: AFRAME`
   - `TypeError: null is not an object (evaluating 'scene.components')`

2. **Dependency**: A-Frame adds an extra dependency layer that can fail
3. **Mobile Reliability**: Three.js has better mobile browser compatibility

### Benefits of Three.js:
1. **Direct Control**: Lower-level API gives more control
2. **No Extra Dependencies**: Just Three.js module from CDN
3. **Better Error Handling**: Easier to debug pure JavaScript
4. **Performance**: Can be more performant with manual optimization
5. **Industry Standard**: Three.js is the de facto standard for WebGL in JavaScript

## Migration Impact

### For Existing Projects:
- **No breaking changes** for existing projects that already use Three.js
- A-Frame projects will continue to work if explicitly specified
- The server still supports both A-Frame and Three.js templates

### For New Projects:
- All new scaffolded projects will use Three.js by default
- Scene tools will generate Three.js code when engine is unknown
- Templates will provide Three.js implementations

## Usage Examples

### Scaffold a New Project (defaults to Three.js now):
```javascript
project_scaffold({ overwrite: false })
// Creates: index.html, main.js, styles.css with Three.js setup
```

### Explicitly Request A-Frame (still supported):
```javascript
project_scaffold({ template: "aframe" })
```

### Scene Tools Auto-Detect:
```javascript
// If index.html doesn't clearly indicate engine, defaults to Three.js
scene_add_primitive({ type: "box", color: "#FF0000" })
// Generates Three.js code
```

## Rebuild Required

After these changes, the project must be rebuilt to compile TypeScript to JavaScript:

```bash
npm run build
```

The compiled output is in the `dist/` directory, which the MCP server uses at runtime.

## Testing

Verified changes in compiled output:
- ✅ `dist/tools/project.js` line 252: `const tmpl = (args?.template || "three");`
- ✅ `dist/tools/scene.js` lines 104, 135, 170, 230, 271, 306, 339: Default to Three.js comments and logic

## Next Steps

1. **Restart MCP Server**: If running, restart to pick up the changes
2. **Test New Projects**: Create a new project and verify it uses Three.js
3. **Mobile Testing**: Test on actual mobile devices to confirm no more A-Frame errors
4. **Update Documentation**: Consider updating user-facing docs to reflect Three.js as default

## Notes

- A-Frame support is **not removed**, just no longer the default
- Users can still explicitly request A-Frame with `template: "aframe"`
- The 8th Wall Desktop projects (`.expanse.json`) are unaffected by this change
- This change addresses the specific error: `"null is not an object (evaluating 'scene.components')"`

---

**Date**: October 6, 2025  
**Author**: AI Assistant  
**Version**: MCP 8th Wall v0.2.4+

