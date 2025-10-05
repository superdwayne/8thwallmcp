import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getProjectRoot } from "../utils/projectRoot.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type Server = McpServer;

// Helper: Read .expanse.json
async function readExpanseJson(): Promise<any> {
  const root = getProjectRoot();
  const candidates = [
    path.join(root, ".expanse.json"),
    path.join(root, "src", ".expanse.json")
  ];
  
  for (const candidate of candidates) {
    try {
      const text = await fs.readFile(candidate, "utf-8");
      return { data: JSON.parse(text), path: candidate };
    } catch {
      continue;
    }
  }
  
  throw new Error("Could not find .expanse.json");
}

// Helper: Write .expanse.json
async function writeExpanseJson(data: any, expansePath: string): Promise<void> {
  await fs.writeFile(expansePath, JSON.stringify(data, null, 2), "utf-8");
}

// Validate component code for basic errors
function validateComponentCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for AFRAME registration
  if (!code.includes('AFRAME.registerComponent')) {
    errors.push('Component must use AFRAME.registerComponent()');
  }
  
  // Check for basic syntax issues
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Mismatched braces - check syntax');
  }
  
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Mismatched parentheses - check syntax');
  }
  
  // Check for common mistakes
  if (code.includes('console.log') && !code.includes('console.error')) {
    // Just a warning, not an error
  }
  
  return { valid: errors.length === 0, errors };
}

export function registerComponentTools(server: Server) {
  // desktop_add_custom_component - Register custom A-Frame component
  server.tool(
    "desktop_add_custom_component",
    "Add a custom A-Frame component to your 8th Wall Desktop project",
    {
      componentName: z.string().describe("Name of the component (e.g., 'light-painter', 'gesture-handler')"),
      componentCode: z.string().describe("Full JavaScript code for the A-Frame component"),
      description: z.string().optional().describe("Optional description of what the component does"),
      validate: z.boolean().optional().default(true).describe("Validate code before writing")
    },
    async (args: any) => {
      const root = getProjectRoot();
      const componentName = String(args.componentName);
      const componentCode = String(args.componentCode);
      const shouldValidate = args.validate !== false;
      
      // Validate code if requested
      if (shouldValidate) {
        const validation = validateComponentCode(componentCode);
        if (!validation.valid) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Component validation failed:\n${validation.errors.join('\n')}\n\nUse validate: false to skip validation.`
              }
            ],
            isError: true
          };
        }
      }
      
      // Ensure components directory exists
      const componentsDir = path.join(root, "src", "components");
      await fs.mkdir(componentsDir, { recursive: true });
      
      // Write component file
      const fileName = `${componentName}.js`;
      const filePath = path.join(componentsDir, fileName);
      const fileContent = `// Custom A-Frame Component: ${componentName}
${args.description ? `// ${args.description}\n` : ''}
${componentCode}
`;
      
      await fs.writeFile(filePath, fileContent, "utf-8");
      
      // Update .expanse.json to include the script
      try {
        const { data: expanse, path: expansePath } = await readExpanseJson();
        
        if (!expanse.scripts) {
          expanse.scripts = [];
        }
        
        const scriptPath = `src/components/${fileName}`;
        if (!expanse.scripts.includes(scriptPath)) {
          expanse.scripts.push(scriptPath);
        }
        
        await writeExpanseJson(expanse, expansePath);
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Created component "${componentName}"\n   📁 File: ${path.relative(root, filePath)}\n   📝 Added to .expanse.json scripts\n\nYou can now use this component in your scene!`
            }
          ]
        };
      } catch (err: any) {
        // Component created but couldn't update .expanse.json
        return {
          content: [
            {
              type: "text",
              text: `⚠️  Created component file but couldn't update .expanse.json: ${err.message}\n   📁 File: ${path.relative(root, filePath)}\n\nManually add "${fileName}" to your .expanse.json scripts array.`
            }
          ]
        };
      }
    }
  );

  // desktop_add_custom_script - Add custom JavaScript file
  server.tool(
    "desktop_add_custom_script",
    "Add a custom JavaScript file to your project (for utilities, helpers, initialization code, etc.)",
    {
      scriptName: z.string().describe("Name for the script file (without .js extension)"),
      scriptCode: z.string().describe("JavaScript code for the script"),
      directory: z.string().optional().default("src").describe("Directory to place the script (default: src)"),
      addToExpanse: z.boolean().optional().default(true).describe("Automatically add to .expanse.json scripts")
    },
    async (args: any) => {
      const root = getProjectRoot();
      const scriptName = String(args.scriptName);
      const scriptCode = String(args.scriptCode);
      const directory = String(args.directory || "src");
      const addToExpanse = args.addToExpanse !== false;
      
      // Ensure directory exists
      const scriptDir = path.join(root, directory);
      await fs.mkdir(scriptDir, { recursive: true });
      
      // Write script file
      const fileName = scriptName.endsWith('.js') ? scriptName : `${scriptName}.js`;
      const filePath = path.join(scriptDir, fileName);
      
      await fs.writeFile(filePath, scriptCode, "utf-8");
      
      let expanseMessage = '';
      
      // Update .expanse.json if requested
      if (addToExpanse) {
        try {
          const { data: expanse, path: expansePath } = await readExpanseJson();
          
          if (!expanse.scripts) {
            expanse.scripts = [];
          }
          
          const scriptPath = `${directory}/${fileName}`;
          if (!expanse.scripts.includes(scriptPath)) {
            expanse.scripts.push(scriptPath);
          }
          
          await writeExpanseJson(expanse, expansePath);
          expanseMessage = '\n   📝 Added to .expanse.json scripts';
        } catch (err: any) {
          expanseMessage = `\n   ⚠️  Couldn't update .expanse.json: ${err.message}`;
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Created script "${fileName}"\n   📁 File: ${path.relative(root, filePath)}${expanseMessage}`
          }
        ]
      };
    }
  );

  // desktop_list_components - List all custom components
  server.tool(
    "desktop_list_components",
    "List all custom components in the project",
    async () => {
      const root = getProjectRoot();
      const componentsDir = path.join(root, "src", "components");
      
      try {
        const files = await fs.readdir(componentsDir);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        if (jsFiles.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No custom components found in src/components/"
              }
            ]
          };
        }
        
        const components: any[] = [];
        for (const file of jsFiles) {
          const filePath = path.join(componentsDir, file);
          const content = await fs.readFile(filePath, "utf-8");
          
          // Try to extract component name from AFRAME.registerComponent call
          const match = content.match(/AFRAME\.registerComponent\(['"]([^'"]+)['"]/);
          const componentName = match ? match[1] : file.replace('.js', '');
          
          // Extract description if present
          const descMatch = content.match(/\/\/\s*(.+)/);
          const description = descMatch ? descMatch[1] : '';
          
          components.push({
            file,
            name: componentName,
            description,
            path: path.relative(root, filePath)
          });
        }
        
        const output = components.map(c => 
          `📦 ${c.name} (${c.file})\n   ${c.description || 'No description'}\n   Path: ${c.path}`
        ).join('\n\n');
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${components.length} custom component(s):\n\n${output}`
            }
          ]
        };
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          return {
            content: [
              {
                type: "text",
                text: "No components directory found. Use desktop_add_custom_component to create your first component."
              }
            ]
          };
        }
        throw err;
      }
    }
  );

  // desktop_remove_component - Remove a custom component
  server.tool(
    "desktop_remove_component",
    "Remove a custom component from the project",
    {
      componentName: z.string().describe("Name of the component file to remove (with or without .js)")
    },
    async (args: any) => {
      const root = getProjectRoot();
      const componentName = String(args.componentName);
      const fileName = componentName.endsWith('.js') ? componentName : `${componentName}.js`;
      const filePath = path.join(root, "src", "components", fileName);
      
      try {
        // Remove file
        await fs.unlink(filePath);
        
        // Update .expanse.json
        try {
          const { data: expanse, path: expansePath } = await readExpanseJson();
          
          if (expanse.scripts) {
            const scriptPath = `src/components/${fileName}`;
            expanse.scripts = expanse.scripts.filter((s: string) => s !== scriptPath);
            await writeExpanseJson(expanse, expansePath);
          }
          
          return {
            content: [
              {
                type: "text",
                text: `✅ Removed component "${fileName}"\n   📝 Updated .expanse.json`
              }
            ]
          };
        } catch {
          return {
            content: [
              {
                type: "text",
                text: `✅ Removed component file "${fileName}"\n   ⚠️  Couldn't update .expanse.json - manually remove the script reference`
              }
            ]
          };
        }
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          return {
            content: [
              {
                type: "text",
                text: `❌ Component "${fileName}" not found`
              }
            ],
            isError: true
          };
        }
        throw err;
      }
    }
  );
}

