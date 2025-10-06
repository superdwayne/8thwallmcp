# GitHub Update Checklist - v0.2.6

## ✅ Ready to Upload

### 📦 New Release Package
**File**: `mcp-8thwall-0.2.6-threejs-default.mcpb`
- **Size**: 6.3MB
- **SHA256**: `d86f82aa10c3c155129b5957fce4ff9d55d2d9bf`
- **Location**: `/Users/dwayne/Documents/Playground/mcp-8thwall/`

## 📝 Files Changed

### Modified Files (commit these):
```
✓ manifest.json               - Version updated to 0.2.6
✓ package.json                - Version updated to 0.2.6
✓ src/tools/project.ts        - Default template changed to "three"
✓ src/tools/scene.ts          - Added Three.js fallback logic
✓ src/tools/templates.ts      - Updated templates to Three.js
✓ mcp-8thwall.dxt            - Updated package file
```

### New Documentation (commit these):
```
✓ RELEASE-0.2.6.md                    - Release notes for v0.2.6
✓ THREEJS_DEFAULT_MIGRATION.md        - Complete migration guide
```

### Compiled Output (automatically built):
```
✓ dist/tools/project.js       - Compiled changes
✓ dist/tools/scene.js         - Compiled changes
✓ dist/tools/templates.js     - Compiled changes
```

## 🚀 GitHub Release Steps

### 1. Stage and Commit Changes
```bash
cd /Users/dwayne/Documents/Playground/mcp-8thwall

# Stage all changes
git add manifest.json package.json
git add src/tools/project.ts src/tools/scene.ts src/tools/templates.ts
git add RELEASE-0.2.6.md THREEJS_DEFAULT_MIGRATION.md
git add mcp-8thwall.dxt
git add dist/

# Commit
git commit -m "Release v0.2.6: Three.js as default framework

- Changed default scaffold template from A-Frame to Three.js
- Added Three.js fallback for all scene manipulation tools
- Updated templates to use Three.js
- Fixed mobile browser compatibility issues
- Added comprehensive migration documentation

Fixes mobile errors:
- ReferenceError: Can't find variable: AFRAME
- TypeError: null is not an object (evaluating 'scene.components')
"
```

### 2. Create Git Tag
```bash
git tag -a v0.2.6 -m "Version 0.2.6 - Three.js Default"
```

### 3. Push to GitHub
```bash
# Push commits
git push origin main

# Push tag
git push origin v0.2.6
```

### 4. Create GitHub Release
1. Go to: https://github.com/superdwayne/8thwallmcp/releases/new
2. **Tag**: Select `v0.2.6`
3. **Release Title**: `v0.2.6: Three.js as Default Framework`
4. **Description**: Copy content from `RELEASE-0.2.6.md`
5. **Attach File**: Upload `mcp-8thwall-0.2.6-threejs-default.mcpb`
6. **Pre-release**: Unchecked (this is a stable release)
7. Click **Publish Release**

## 📋 Release Description (use this on GitHub)

```markdown
# Release v0.2.6: Three.js as Default Framework

## 🎯 Major Change
Three.js is now the default framework for all new projects, replacing A-Frame. This improves mobile browser compatibility and eliminates runtime errors.

## ✨ What's New
- ✅ Three.js as default scaffold template
- ✅ Automatic Three.js fallback in scene tools
- ✅ Updated templates with pure Three.js implementations
- ✅ Better mobile browser support
- ✅ Comprehensive migration documentation

## 🐛 Fixes
- Fixed: `ReferenceError: Can't find variable: AFRAME`
- Fixed: `TypeError: null is not an object (evaluating 'scene.components')`
- Fixed: A-Frame CDN loading failures on mobile

## 📦 Downloads
- **Package**: `mcp-8thwall-0.2.6-threejs-default.mcpb` (6.3MB)
- **SHA256**: `d86f82aa10c3c155129b5957fce4ff9d55d2d9bf`

## 📚 Documentation
- [Release Notes](./RELEASE-0.2.6.md)
- [Migration Guide](./THREEJS_DEFAULT_MIGRATION.md)
- [Three.js Guide](./THREEJS_SCRIPT_GUIDE.md)

## ⬆️ Upgrading
Simply install the new `.mcpb` file. **No breaking changes** - A-Frame projects continue to work!

## 🙏 Credits
Thanks to users who reported mobile compatibility issues!

**Full Changelog**: [v0.2.4...v0.2.6](https://github.com/superdwayne/8thwallmcp/compare/v0.2.4...v0.2.6)
```

## 🔍 Verification Checklist

Before publishing, verify:
- [ ] Version in `package.json` is `0.2.6`
- [ ] Version in `manifest.json` is `0.2.6`
- [ ] All tests pass (if you have them)
- [ ] `dist/` folder is rebuilt with latest changes
- [ ] `.mcpb` file is correctly named and sized (~6.3MB)
- [ ] Release notes are complete
- [ ] Migration guide is accurate

## 📊 Package Details

```
Archive: mcp-8thwall-0.2.6-threejs-default.mcpb
├── Package Size: 6.3MB (compressed)
├── Unpacked Size: 26.7MB
├── Total Files: 1,370
├── Included Files: 326 (after .dxtignore)
└── SHA256: d86f82aa10c3c155129b5957fce4ff9d55d2d9bf
```

## 🎉 Post-Release

After publishing:
1. ✅ Update any package registries (npm, MCP directory, etc.)
2. ✅ Announce in discussions/social media
3. ✅ Close related GitHub issues
4. ✅ Update main README if needed

---

## 🆘 Need Help?

If you encounter any issues during the release:
1. Check git status: `git status`
2. Verify tag exists: `git tag -l`
3. Check remote: `git remote -v`
4. Re-build if needed: `npm run build && npm run pack:dxt`

---

**Ready to Release**: All files are prepared and ready for GitHub!  
**Estimated Time**: 5-10 minutes for complete release process

