# 📦 One-Click Installation with DXT

This MCP server can be packaged as a `.dxt` file for one-click installation into Claude Desktop.

## For Users: Install the `.dxt` File

1. **Download** the `mcp-8thwall.dxt` file from releases
2. **Double-click** the `.dxt` file (or open it with Claude Desktop)
3. **Done!** The MCP server will be automatically configured

## For Developers: Create the `.dxt` Package

### Step 1: Install DXT Tool (One-time setup)

```bash
npm run install:dxt
```

Or manually:

```bash
npm install -g @anthropic-ai/dxt
```

### Step 2: Build and Package

```bash
npm run pack:dxt
```

This will:
- Build the TypeScript source (`npm run build`)
- Package everything into `mcp-8thwall.dxt`

### Step 3: Distribute

Share the generated `mcp-8thwall.dxt` file with users. They can install it with one click!

## What's Included in the Package

The `.dxt` file includes:
- ✅ All compiled code (`dist/`)
- ✅ Dependencies (`node_modules/`)
- ✅ Configuration (`manifest.json`)
- ✅ Documentation (`README.md`)

## Manual Installation (Alternative)

If you prefer not to use DXT, you can still install manually by editing `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-8thwall": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-8thwall/dist/index.js"]
    }
  }
}
```

## Troubleshooting

### DXT tool not found
```bash
npm install -g @anthropic-ai/dxt
```

### Build errors
Make sure dependencies are installed:
```bash
npm install
npm run build
```

### Package is too large
The DXT will include `node_modules/`. To reduce size, consider:
- Using `npm ci --production` before packaging
- Adding unnecessary files to `.dxtignore`

## Resources

- [DXT Specification](https://github.com/anthropics/dxt)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [8th Wall Desktop Docs](https://www.8thwall.com/docs/desktop/)

