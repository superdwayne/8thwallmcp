import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getProjectRoot } from "../utils/projectRoot.js";

type Server = any;

// Template for a working XR8 + Three.js script
function generateThreeJSScript(options: {
  name: string;
  description?: string;
  addParticles?: boolean;
  addTouchHandling?: boolean;
}): string {
  const { name, description, addParticles, addTouchHandling } = options;
  
  return `// ${name}
${description ? `// ${description}\n` : ''}
console.log('📦 ${name}: Loading...');

// Module state
let scene = null;
let camera = null;
let canvas = null;
let initialized = false;

// Create the camera pipeline module
const ${name}Module = {
  name: '${name.toLowerCase().replace(/\s+/g, '-')}',
  
  onStart: ({ canvas: c }) => {
    console.log('✅ ${name}: onStart called');
    canvas = c || document.querySelector('canvas');
  },
  
  onAttach: ({ canvas: c }) => {
    console.log('✅ ${name}: onAttach called');
    if (!canvas) canvas = c || document.querySelector('canvas');
  },
  
  onUpdate: ({ processCpuResult }) => {
    // Initialize on first frame
    if (!initialized) {
      tryInitialize();
    }
    
    // Update logic here (runs every frame)
    if (initialized) {
      // Your per-frame update code
    }
  },
};

// Wait for XR8 to be ready
window.addEventListener('xrloaded', () => {
  console.log('✅ XR8 Ready, adding ${name} module...');
  
  // Add the Threejs pipeline module + our custom module
  XR8.addCameraPipelineModules([
    XR8.Threejs.pipelineModule(),  // Enable Three.js
    ${name}Module                   // Our custom module
  ]);
  
  console.log('✅ ${name} pipeline module added');
});

function tryInitialize() {
  // Get the xrScene wrapper object
  let xrSceneWrapper;
  try {
    xrSceneWrapper = XR8.Threejs.xrScene();
  } catch (e) {
    return;
  }
  
  if (!xrSceneWrapper || !xrSceneWrapper.scene || !xrSceneWrapper.camera) {
    return;
  }
  
  // Extract the REAL Three.js scene and camera from the wrapper
  scene = xrSceneWrapper.scene;
  camera = xrSceneWrapper.camera;
  
  console.log('✅ ${name}: Initialized!');
  console.log('   - Scene:', scene);
  console.log('   - Camera:', camera);
  
  // Your initialization code here
  setupScene();
  
  // Mark as initialized
  initialized = true;
}

function setupScene() {
  // Add your Three.js objects to the scene here
  ${addParticles ? `
  // Example: Add a test sphere
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,
    name: 'TestMaterial'
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = 'TestSphere';
  sphere.position.set(0, 0, -0.5);  // 0.5m in front of camera
  scene.add(sphere);
  console.log('✅ Added test sphere to scene');
  ` : '  // Add your Three.js objects here'}
  
  ${addTouchHandling ? `
  // Setup touch/mouse handling
  if (canvas) {
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    console.log('✅ Event listeners attached');
  }
  ` : ''}
}

${addTouchHandling ? `
function onTouchStart(e) {
  e.preventDefault();
  console.log('👆 Touch at:', e.touches[0].clientX, e.touches[0].clientY);
  // Handle touch events
}

function onMouseDown(e) {
  console.log('🖱️ Mouse down at:', e.clientX, e.clientY);
  // Handle mouse events
}
` : ''}

console.log('📦 ${name}: Loaded');
`;
}

// Helper to read .expanse.json
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

// Helper to write .expanse.json
async function writeExpanseJson(data: any, expansePath: string): Promise<void> {
  await fs.writeFile(expansePath, JSON.stringify(data, null, 2), "utf-8");
}

export function registerScriptTemplates(server: Server) {
  server.tool(
    "desktop_add_threejs_script",
    "Add a working Three.js script with proper XR8 pipeline setup for 8th Wall Desktop",
    {
      scriptName: z.string().describe("Name for the script (e.g., 'my-effect', 'particle-system')"),
      description: z.string().optional().describe("Optional description of what the script does"),
      addTestSphere: z.boolean().optional().default(false).describe("Add a test sphere to verify it's working"),
      addTouchHandling: z.boolean().optional().default(false).describe("Include touch/mouse event handling"),
      directory: z.string().optional().default("src").describe("Directory to place the script (default: src)")
    },
    async (args: any) => {
      const root = getProjectRoot();
      const scriptName = String(args.scriptName);
      const directory = String(args.directory || "src");
      
      // Ensure directory exists
      const scriptDir = path.join(root, directory);
      await fs.mkdir(scriptDir, { recursive: true });
      
      // Generate the script
      const scriptContent = generateThreeJSScript({
        name: scriptName,
        description: args.description,
        addParticles: args.addTestSphere,
        addTouchHandling: args.addTouchHandling
      });
      
      // Write script file
      const fileName = scriptName.endsWith('.js') ? scriptName : `${scriptName}.js`;
      const filePath = path.join(scriptDir, fileName);
      
      await fs.writeFile(filePath, scriptContent, "utf-8");
      
      // Update .expanse.json to include the script
      let expanseMessage = '';
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
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Created Three.js script "${fileName}"
   📁 File: ${path.relative(root, filePath)}${expanseMessage}
   
💡 This script includes:
   - Proper XR8.Threejs.pipelineModule() setup
   - Access to real scene and camera via xrScene().scene / .camera
   - onUpdate callback for per-frame logic
   ${args.addTestSphere ? '- Test sphere at 0.5m in front of camera\n   ' : ''}${args.addTouchHandling ? '- Touch/mouse event handling\n   ' : ''}
🎯 Ready to use in 8th Wall Desktop!`
          }
        ]
      };
    }
  );
}

