# Release v0.2.11: Cylinder Geometry Fix

## 🐛 Bug Fix Release

This release fixes a critical bug in cylinder geometry creation that caused crashes in 8th Wall Desktop.

## What's Fixed

### Cylinder Geometry Properties
- **Fixed**: Removed incorrect `radiusTop` and `radiusBottom` properties from cylinder geometry
- **Fixed**: Cylinders now use the correct single `radius` property
- **Fixed**: Eliminated `TypeError: Cannot read properties of undefined (reading 'toFixed')` error

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
- ✅ No breaking changes to other geometry types
- ✅ Existing projects with correctly formatted cylinders unaffected

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

## Credits

Special thanks to the user who reported this issue and helped identify the correct geometry format! 🙏

---

**Full Changelog**: [v0.2.10...v0.2.11](https://github.com/superdwayne/8thwallmcp/compare/v0.2.10...v0.2.11)

Report issues: https://github.com/superdwayne/8thwallmcp/issues

