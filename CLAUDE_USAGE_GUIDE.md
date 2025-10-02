# Using 8th Wall MCP Server with Claude Desktop

## Quick Setup

Your Claude Desktop is configured to use this MCP server. The configuration is in:
`~/Library/Application Support/Claude/claude_desktop_config.json`

## Important: Build Before Using

**Every time you make changes to the TypeScript source files**, you MUST rebuild:

```bash
cd /Users/dwayne/Documents/Playground/mcp-8thwall
npm run build
```

After building, **restart Claude Desktop** for changes to take effect.

## Working with 8th Wall Desktop Projects

### Step 1: Set Your Project Directory

When working with a specific 8th Wall Desktop project (e.g., `/Users/dwayne/Documents/8th Wall/fire9`), first set the project root:

**Option A: Using full path**
```
Use the project_set_root tool with path: /Users/dwayne/Documents/8th Wall/fire9
```

**Option B: Using project name (if in default location)**
```
Use desktop_set_project tool with name: fire9
```

### Step 2: Verify the Project Root

Check that the project root is set correctly:
```
Use project_get_root tool
```

### Step 3: Check Project Structure

See what's in your project:
```
Use desktop_read_json tool to read .expanse.json
```

Or list the project files:
```
Use project_get_info tool
```

### Step 4: Add Objects to Scene

Now you can add shapes, models, etc.:
```
Use desktop_add_shape tool with parameters like:
- name: "my-ring"
- geometryType: "torus"
- position: [0, 0, -3]
- color: "#FFD700"
- materialType: "standard"
- roughness: 0.2
- metalness: 0.8
- radius: 1
- tube: 0.3
```

## Common Issues

### Issue 1: Changes Not Appearing
**Solution**: Run `npm run build` and restart Claude Desktop

### Issue 2: "Project not found" errors
**Solution**: Use `project_set_root` first before calling other tools

### Issue 3: Path with spaces not working
**Solution**: Use the full path without escaping, e.g., `/Users/dwayne/Documents/8th Wall/fire9`

## Available Tool Categories

### Project Tools
- `project_get_root` - Get current project directory
- `project_set_root` - Set project directory
- `desktop_list_projects` - List all 8th Wall projects
- `desktop_set_project` - Set project by name
- `project_get_info` - Get project file structure
- `project_list_files` - List files in project
- `project_read_file` - Read a specific file
- `project_write_file` - Write/create a file
- `project_delete_file` - Delete a file
- `project_move_file` - Move/rename a file

### Desktop Tools (for .expanse.json)
- `desktop_read_json` - Read .expanse.json
- `desktop_write_json` - Write entire .expanse.json
- `desktop_patch_json` - Patch specific parts
- `desktop_add_shape` - Add 3D shapes (box, sphere, cylinder, plane, circle, cone, torus, ring)
- `desktop_enable_face_tracking` - Enable face tracking
- `desktop_guess_scene` - Find scene/config files

### Scene Tools (for web projects)
- `scene_detect_engine` - Detect if using A-Frame or Three.js
- `scene_add_gltf_model` - Add 3D models
- `scene_set_background_color` - Set scene background
- `scene_add_primitive` - Add basic shapes
- `scene_add_light` - Add lights
- `scene_set_environment_hdr` - Set HDR environment
- `scene_add_animation` - Add animations
- `scene_add_textured_plane` - Add textured planes
- `scene_add_orbit_controls` - Add orbit controls (Three.js)
- `scene_add_grid_helper` - Add grid helper
- `scene_add_floor` - Add floor plane

### Asset Tools
- `assets_search_polyhaven` - Search PolyHaven for HDRIs, textures, models
- `assets_polyhaven_categories` - List categories
- `assets_polyhaven_files` - Get file info for an asset
- `assets_download_url` - Download asset from URL
- `assets_unzip` - Extract zip files

### Dev Server Tools
- `devserver_start` - Start local dev server
- `devserver_stop` - Stop local dev server

### Docs Tools
- `docs_get_page` - Fetch 8th Wall documentation
- `docs_search` - Search documentation

## Example Workflow: Adding a Ring to fire9 Project

1. **Set project**: 
   - Use `project_set_root` with path `/Users/dwayne/Documents/8th Wall/fire9`

2. **Check structure**: 
   - Use `desktop_read_json` to see current scene

3. **Add ring**: 
   - Use `desktop_add_shape` with:
     - name: "golden-ring"
     - geometryType: "torus"
     - position: [0, 0, -3]
     - color: "#FFD700"
     - materialType: "standard"
     - roughness: 0.2
     - metalness: 0.8
     - radius: 1
     - tube: 0.3

4. **Verify**: 
   - Use `desktop_read_json` again to confirm the ring was added

## Troubleshooting

If you get errors when using Claude:

1. **Check if project root is set**:
   ```
   project_get_root
   ```

2. **List available projects**:
   ```
   desktop_list_projects
   ```

3. **Check if .expanse.json exists**:
   ```
   project_list_files
   ```

4. **Read the .expanse.json structure**:
   ```
   desktop_read_json
   ```

## Development Mode

If you want to test changes quickly:

1. Make changes to `.ts` files in `src/`
2. Run `npm run build`
3. Restart Claude Desktop
4. Test your changes

## Need Help?

- Check `README.md` for general information
- Check `ELEMENT_ADDING_GUIDE.md` for 8th Wall Desktop specific info
- Check `SIMPLE_CONFIG.md` for configuration details


