# Simple MCP Configuration Guide

## 🎯 **Minimal Config (No Environment Variables!)**

### **Your Cursor Config (`~/.cursor/mcp.json`)**

```json
{
  "mcpServers": {
    "8thwall": {
      "command": "node",
      "args": [
        "/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"
      ]
    }
  }
}
```

**That's it!** No `env` section needed! 🎉

---

## 🏠 **Default Project Root**

By default, the MCP server looks in:
```
~/Documents/8th Wall/
```

This means it will automatically find your 8th Wall Desktop projects!

---

## 🔄 **Switch Projects Dynamically**

You can change the project root at any time without editing the config:

### **Method 1: Set Specific Project by Name**

Ask Claude:
```
Set project to fire3
```

This sets the root to: `~/Documents/8th Wall/fire3/`

### **Method 2: Set Any Directory**

Ask Claude:
```
Set project root to /Users/dwayne/Documents/MyOtherProject
```

### **Method 3: Check Current Root**

Ask Claude:
```
What is the current project root?
```

---

## 🚀 **Example Workflow**

### **Scenario 1: Working with Multiple Projects**

```
You: List my 8th Wall projects
Assistant: [Shows projects in ~/Documents/8th Wall/]

You: Set project to fire3
Assistant: ✅ Project root set to /Users/dwayne/Documents/8th Wall/fire3

You: Show me the scene objects
Assistant: [Shows objects from fire3/.expanse.json]

You: Set project to adnight14
Assistant: ✅ Project root set to /Users/dwayne/Documents/8th Wall/adnight14

You: Add a red sphere at [0, 1, -3]
Assistant: [Adds sphere to adnight14/.expanse.json]
```

### **Scenario 2: Working Outside 8th Wall Folder**

```
You: Set project root to /Users/dwayne/Downloads/my-xr-project
Assistant: ✅ Project root set to /Users/dwayne/Downloads/my-xr-project

You: List files
Assistant: [Shows files from that directory]
```

---

## 🛠️ **Available MCP Tools for Project Management**

### **Get Current Root**
```
What is the current project root?
```
Tool: `project_get_root`

### **Set Any Directory**
```
Set project root to /path/to/project
```
Tool: `project_set_root`

### **List 8th Wall Desktop Projects**
```
List my 8th Wall projects
```
Tool: `desktop_list_projects`

### **Set 8th Wall Project by Name**
```
Set project to fire3
```
Tool: `desktop_set_project`

---

## 📋 **Complete Config Examples**

### **Cursor** (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "8thwall": {
      "command": "node",
      "args": [
        "/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"
      ]
    }
  }
}
```

### **Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "8thwall": {
      "command": "node",
      "args": [
        "/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"
      ]
    }
  }
}
```

---

## 🎯 **Benefits of This Approach**

✅ **No config editing** - Switch projects in chat  
✅ **Clean config** - Just command and args  
✅ **Works everywhere** - Same config for all projects  
✅ **Smart defaults** - Auto-finds 8th Wall Desktop projects  
✅ **Flexible** - Can point to any directory  

---

## 🔧 **Advanced: Override Default Root**

If you want a different default (not `~/Documents/8th Wall`), you can still set it:

```json
{
  "mcpServers": {
    "8thwall": {
      "command": "node",
      "args": [
        "/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"
      ],
      "env": {
        "PROJECT_ROOT": "/your/custom/default/path"
      }
    }
  }
}
```

But you probably don't need this! 🎉

---

## 🧪 **Test It**

1. **Update your config** to the minimal version (remove `env` section)
2. **Restart Cursor**
3. **Ask Claude:**
   ```
   What is my current project root?
   ```
4. **Switch projects:**
   ```
   Set project to fire3
   ```
5. **Verify:**
   ```
   List files in the current project
   ```

---

## 📊 **How It Works**

1. **Default Root**: Server starts with `~/Documents/8th Wall` as default
2. **Dynamic Switching**: Use MCP tools to change `PROJECT_ROOT` environment variable at runtime
3. **Persistence**: Project root stays set until you change it again or restart the server
4. **No Config Changes**: Everything happens in the chat!

---

## 🎉 **Ready to Use!**

Your simplified config:

```json
"8thwall": {
  "command": "node",
  "args": [
    "/Users/dwayne/Documents/Playground/mcp-8thwall/dist/index.js"
  ]
}
```

**Just restart Cursor and start chatting!** 🚀

Ask: `"Set project to fire3"` or `"List my 8th Wall projects"`

