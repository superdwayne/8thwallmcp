# Release v0.2.11: Cylinder Geometry Fix + New Primitives

## 🐛 Bug Fixes + ✨ New Features

This release fixes a critical bug in cylinder geometry creation and adds support for two new primitive types.

## What's Fixed

### Cylinder Geometry Properties
- **Fixed**: Removed incorrect `radiusTop` and `radiusBottom` properties from cylinder geometry
- **Fixed**: Cylinders now use the correct single `radius` property
- **Fixed**: Eliminated `TypeError: Cannot read properties of undefined (reading 'toFixed')` error

### Ring Geometry Defaults
- **Fixed**: Ring `innerRadius` default changed from `0.5` → `0.25`
- **Fixed**: Ring `outerRadius` default changed from `1` → `0.5`
- Now matches 8th Wall Desktop defaults

## What's New

### New Primitive Types
- ✅ **Capsule**: Pill-shaped primitive with `radius` and `height` properties
- ✅ **Polyhedron**: Multi-faced primitive with `radius` and `faces` properties (4=tetrahedron, 8=octahedron, 12=dodecahedron, 20=icosahedron)

### Color Support
- Added default colors for new primitives:
  - Capsule: `#74b9ff` (Light Blue)
  - Polyhedron: `#55efc4` (Mint Green)

### Before (Broken)
```json
{
  "type": "cylinder",
  "radiusTop": 0.5,
  "radiusBottom": 0.5,
  "height": 1
}
```

### After (Fixed)
```json
{
  "type": "cylinder",
  "radius": 0.5,
  "height": 1
}
```

## Technical Details

### Changes Made
1. Removed `radiusTop` and `radiusBottom` from geometry validation function
2. Removed these properties from the schema definition in `desktop_add_shape` tool
3. Cylinder creation now correctly uses only `radius` and `height` properties

### Files Modified
- `src/tools/desktop.ts` - Fixed cylinder geometry validation and schema
- `dist/tools/desktop.js` - Compiled changes
- `mcp-8thwall.dxt` - Updated package bundle

## Impact

- ✅ Cylinders can now be added without crashes
- ✅ 8th Wall Desktop properly reads cylinder properties
- ✅ Two new primitive types available (capsule, polyhedron)
- ✅ Ring geometry uses correct default values
- ✅ All geometry defaults now match 8th Wall Desktop exactly
- ✅ No breaking changes to existing code

## Installation

Download the updated package: **`mcp-8thwall-0.2.11.mcpb`**

Update your MCP configuration:
```json
{
  "mcpServers": {
    "8thwall": {
      "command": "path/to/mcp-8thwall-0.2.11.mcpb"
    }
  }
}
```

## Testing

Tested scenarios:
- ✅ Creating cylinders via MCP tools
- ✅ Cylinder geometry validates correctly
- ✅ No `toFixed` errors in 8th Wall Desktop
- ✅ Colored materials render correctly with `basic` type
- ✅ Capsule and polyhedron primitives create successfully
- ✅ Ring geometry with corrected defaults
- ✅ All 10 primitive types working: box, sphere, cylinder, cone, circle, plane, torus, ring, capsule, polyhedron

## Credits

Special thanks to the user who reported this issue and helped identify the correct geometry format! 🙏

---

**Full Changelog**: [v0.2.10...v0.2.11](https://github.com/superdwayne/8thwallmcp/compare/v0.2.10...v0.2.11)

Report issues: https://github.com/superdwayne/8thwallmcp/issues

