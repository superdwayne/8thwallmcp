import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { getProjectRoot } from "../utils/projectRoot.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type Server = McpServer;

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TemplateConfig {
  name: string;
  description: string;
  category: string;
  components: string[];
  steps: string[];
  customCode?: string;
}

const TEMPLATES: Record<string, TemplateConfig> = {
  'light-painting': {
    name: 'Light Painting',
    description: 'Touch-based particle drawing system with color picker',
    category: 'Interactive',
    components: ['particleSystem.js', 'gestureHandler.js'],
    steps: [
      'Add particle-system component to scene',
      'Add gesture-handler component to scene',
      'Create UI for color selection',
      'Wire up gesture events to create particles',
      'Add clear button'
    ],
    customCode: `// Light Painting Integration
window.addEventListener('load', () => {
  const scene = document.querySelector('a-scene');
  const particleSystem = scene.components['particle-system'];
  
  // Listen to gesture events
  scene.addEventListener('gesture-move', (evt) => {
    if (particleSystem && evt.detail.worldPosition) {
      particleSystem.createParticle(evt.detail.worldPosition);
    }
  });
  
  // Create color picker UI
  const uiContainer = document.createElement('div');
  uiContainer.id = 'color-picker-ui';
  uiContainer.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; padding: 10px; background: rgba(0,0,0,0.5); border-radius: 10px; z-index: 1000;';
  
  const colors = ['#FFD700', '#FF69B4', '#00FFFF', '#7FFF00', '#FF4500', '#800080'];
  colors.forEach(color => {
    const btn = document.createElement('button');
    btn.style.cssText = \`width: 40px; height: 40px; border-radius: 50%; border: 2px solid white; background: \${color}; cursor: pointer;\`;
    btn.addEventListener('click', () => {
      if (particleSystem) particleSystem.setColor(color);
    });
    uiContainer.appendChild(btn);
  });
  
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.style.cssText = 'padding: 10px 20px; border-radius: 5px; border: none; background: #FF0000; color: white; cursor: pointer;';
  clearBtn.addEventListener('click', () => {
    if (particleSystem) particleSystem.clearAll();
  });
  uiContainer.appendChild(clearBtn);
  
  document.body.appendChild(uiContainer);
});`
  },
  
  'model-showcase': {
    name: 'Model Showcase',
    description: 'Display 3D model with rotation, lighting, and controls',
    category: 'Display',
    components: [],
    steps: [
      'Add model to scene at optimal viewing position',
      'Add Y-axis rotation animation (60°/sec)',
      'Add ambient lighting (intensity: 0.8)',
      'Add directional lighting for depth',
      'Optional: Add tap interaction to toggle rotation'
    ]
  },
  
  'image-target-video': {
    name: 'Image Target with Video',
    description: 'AR image tracking with video overlay',
    category: 'AR Tracking',
    components: [],
    steps: [
      'Configure camera for image targets',
      'Add image target with marker image',
      'Create video plane as child of target',
      'Configure video autoplay settings',
      'Add play/pause controls'
    ]
  },
  
  'portal-experience': {
    name: 'AR Portal',
    description: 'Create an AR portal with hider materials',
    category: 'AR Effects',
    components: [],
    steps: [
      'Create portal frame (torus geometry)',
      'Add hider material plane (colorWrite: false)',
      'Add portal content behind hider',
      'Add glowing emissive effect to frame',
      'Add pulse animation to frame'
    ]
  },
  
  'physics-playground': {
    name: 'Physics Playground',
    description: 'Interactive physics-enabled objects',
    category: 'Interactive',
    components: ['physicsHelper.js'],
    steps: [
      'Add ground plane (static physics)',
      'Add physics-enabled objects (dynamic)',
      'Configure mass and restitution',
      'Add tap interaction to spawn objects',
      'Optional: Add reset button'
    ]
  },
  
  'face-filter': {
    name: 'Face Filter',
    description: 'Face tracking with 3D objects',
    category: 'AR Tracking',
    components: [],
    steps: [
      'Enable face tracking',
      'Add objects attached to face',
      'Position objects on facial landmarks',
      'Optional: Add debug face mesh',
      'Test on device with camera'
    ]
  }
};

export function registerTemplateTools(server: Server) {
  // apply_experience_template - Apply a pre-built template
  server.tool(
    "apply_experience_template",
    "Apply a pre-configured AR experience template. This automatically sets up components, code, and configurations.",
    {
      template: z.enum(['light-painting', 'model-showcase', 'image-target-video', 'portal-experience', 'physics-playground', 'face-filter']).describe("Template to apply"),
      customize: z.object({
        modelPath: z.string().optional(),
        imagePath: z.string().optional(),
        videoPath: z.string().optional(),
        colors: z.array(z.string()).optional()
      }).optional().describe("Optional customization parameters")
    },
    async (args: any) => {
      const templateKey = String(args.template);
      const template = TEMPLATES[templateKey];
      const customize = args.customize || {};
      
      if (!template) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Template "${templateKey}" not found. Use list_templates to see available templates.`
            }
          ],
          isError: true
        };
      }
      
      const root = getProjectRoot();
      const steps: string[] = [];
      
      steps.push(`🎨 Applying Template: ${template.name}`);
      steps.push(`📝 ${template.description}`);
      steps.push('');
      
      // Copy required components
      if (template.components.length > 0) {
        steps.push('📦 Setting up components:');
        for (const component of template.components) {
          const srcPath = path.join(__dirname, '..', 'components', component);
          const destDir = path.join(root, 'src', 'components');
          const destPath = path.join(destDir, component);
          
          try {
            await fs.mkdir(destDir, { recursive: true });
            const componentCode = await fs.readFile(srcPath, 'utf-8');
            await fs.writeFile(destPath, componentCode, 'utf-8');
            steps.push(`   ✅ Copied ${component}`);
          } catch (err: any) {
            steps.push(`   ⚠️  Could not copy ${component}: ${err.message}`);
          }
        }
        steps.push('');
      }
      
      // Add custom code if present
      if (template.customCode) {
        const customScriptPath = path.join(root, 'src', `${templateKey}-integration.js`);
        try {
          await fs.writeFile(customScriptPath, template.customCode, 'utf-8');
          steps.push(`✅ Created integration script: src/${templateKey}-integration.js`);
          steps.push('');
        } catch (err: any) {
          steps.push(`⚠️  Could not create integration script: ${err.message}`);
          steps.push('');
        }
      }
      
      // Provide implementation steps
      steps.push('📋 Implementation Steps:');
      template.steps.forEach((step, index) => {
        steps.push(`   ${index + 1}. ${step}`);
      });
      steps.push('');
      
      // Template-specific guidance
      if (templateKey === 'light-painting') {
        steps.push('💡 Light Painting Setup:');
        steps.push('   • Add particle-system component to <a-scene>');
        steps.push('   • Add gesture-handler component to <a-scene>');
        steps.push('   • Include the integration script in your .expanse.json');
        steps.push('   • Test on actual device for touch interactions');
      } else if (templateKey === 'model-showcase') {
        steps.push('💡 Model Showcase Setup:');
        if (customize.modelPath) {
          steps.push(`   • Using model: ${customize.modelPath}`);
          steps.push(`   • Use: desktop_add_model with path "${customize.modelPath}"`);
        } else {
          steps.push('   • Use: search_ar_assets to find a model');
          steps.push('   • Use: desktop_add_model to add it');
        }
        steps.push('   • Use: desktop_add_rotation_animation for spinning effect');
      } else if (templateKey === 'image-target-video') {
        steps.push('💡 Image Target Setup:');
        if (customize.imagePath) {
          steps.push(`   • Using marker: ${customize.imagePath}`);
        }
        if (customize.videoPath) {
          steps.push(`   • Using video: ${customize.videoPath}`);
        }
        steps.push('   • Use: desktop_add_image_target');
        steps.push('   • Use: desktop_add_video with parentId of target');
      } else if (templateKey === 'portal-experience') {
        steps.push('💡 Portal Setup:');
        steps.push('   • Use: desktop_add_shape with type: "torus" for frame');
        steps.push('   • Use: desktop_add_shape with colorWrite: false for hider');
        steps.push('   • Position content behind the hider plane');
        steps.push('   • Use: desktop_add_scale_animation for pulse effect');
      }
      
      steps.push('');
      steps.push('🛠️  Next Steps:');
      steps.push('   1. Review the components and scripts created');
      steps.push('   2. Use the recommended tools listed above');
      steps.push('   3. Test in 8th Wall Desktop');
      steps.push('   4. Deploy to device for full AR experience');
      
      return {
        content: [
          {
            type: "text",
            text: steps.join('\n')
          }
        ]
      };
    }
  );

  // list_templates - List all available templates
  server.tool(
    "list_templates",
    "List all available AR experience templates with descriptions",
    {
      category: z.string().optional().describe("Filter by category (Interactive, Display, AR Tracking, AR Effects)")
    },
    async (args: any) => {
      const category = args.category;
      
      let templates = Object.entries(TEMPLATES);
      if (category) {
        templates = templates.filter(([_, tmpl]) => 
          tmpl.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      if (templates.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No templates found${category ? ` in category "${category}"` : ''}`
            }
          ]
        };
      }
      
      const categories = Array.from(new Set(templates.map(([_, t]) => t.category)));
      
      const output: string[] = [];
      output.push('📚 Available AR Experience Templates:\n');
      
      for (const cat of categories) {
        output.push(`\n🏷️  ${cat}:`);
        const catTemplates = templates.filter(([_, t]) => t.category === cat);
        
        for (const [key, tmpl] of catTemplates) {
          output.push(`\n   📦 ${key}`);
          output.push(`      ${tmpl.name} - ${tmpl.description}`);
          if (tmpl.components.length > 0) {
            output.push(`      Components: ${tmpl.components.join(', ')}`);
          }
        }
      }
      
      output.push('\n\n💡 Usage:');
      output.push('   apply_experience_template with template: "template-name"');
      output.push('\n📖 Examples:');
      output.push('   • apply_experience_template({ template: "light-painting" })');
      output.push('   • apply_experience_template({ template: "model-showcase", customize: { modelPath: "assets/dragon.glb" } })');
      
      return {
        content: [
          {
            type: "text",
            text: output.join('\n')
          }
        ]
      };
    }
  );

  // get_template_info - Get detailed information about a specific template
  server.tool(
    "get_template_info",
    "Get detailed information about a specific template",
    {
      template: z.string().describe("Template name to get info about")
    },
    async (args: any) => {
      const templateKey = String(args.template);
      const template = TEMPLATES[templateKey];
      
      if (!template) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Template "${templateKey}" not found. Use list_templates to see available templates.`
            }
          ],
          isError: true
        };
      }
      
      const output: string[] = [];
      output.push(`📦 Template: ${template.name}`);
      output.push(`📝 ${template.description}`);
      output.push(`🏷️  Category: ${template.category}`);
      output.push('');
      
      if (template.components.length > 0) {
        output.push('📦 Required Components:');
        template.components.forEach(c => output.push(`   • ${c}`));
        output.push('');
      }
      
      output.push('📋 Implementation Steps:');
      template.steps.forEach((step, i) => output.push(`   ${i + 1}. ${step}`));
      
      if (template.customCode) {
        output.push('');
        output.push('✅ Includes custom integration code');
      }
      
      return {
        content: [
          {
            type: "text",
            text: `${output.join('\n')}\n\nTemplate JSON:\n${JSON.stringify(template, null, 2)}`
          }
        ]
      };
    }
  );
}

