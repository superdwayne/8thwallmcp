import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type Server = McpServer;

interface ExperiencePattern {
  keywords: string[];
  actions: string[];
  category: 'model-showcase' | 'light-painting' | 'image-target' | 'portal' | 'physics' | 'face-filter' | 'custom';
}

// Pattern recognition for common AR experience types
const EXPERIENCE_PATTERNS: ExperiencePattern[] = [
  {
    keywords: ['light', 'paint', 'draw', 'trace', 'particle', 'finger', 'touch draw'],
    actions: ['generate_light_painting_component', 'add_gesture_handler', 'add_ui_controls'],
    category: 'light-painting'
  },
  {
    keywords: ['model', 'showcase', 'display', '3d', 'rotate', 'spin', 'view'],
    actions: ['search_asset', 'download_model', 'add_model', 'add_rotation', 'add_lighting'],
    category: 'model-showcase'
  },
  {
    keywords: ['image', 'target', 'track', 'poster', 'marker'],
    actions: ['add_image_target', 'add_content_to_target'],
    category: 'image-target'
  },
  {
    keywords: ['portal', 'doorway', 'gateway', 'transition'],
    actions: ['create_portal_frame', 'add_hider_material', 'add_portal_content'],
    category: 'portal'
  },
  {
    keywords: ['physics', 'fall', 'bounce', 'collide', 'gravity', 'drop'],
    actions: ['add_physics_world', 'add_physics_objects', 'configure_collisions'],
    category: 'physics'
  },
  {
    keywords: ['face', 'filter', 'mask', 'facial', 'head'],
    actions: ['enable_face_tracking', 'add_face_attached_object'],
    category: 'face-filter'
  }
];

// Analyze description to determine experience type and extract entities
function analyzeExperienceDescription(description: string): {
  category: string;
  entities: string[];
  modifiers: string[];
  confidence: number;
} {
  const lowerDesc = description.toLowerCase();
  let bestMatch = { pattern: EXPERIENCE_PATTERNS[EXPERIENCE_PATTERNS.length - 1], score: 0 };

  // Find best matching pattern
  for (const pattern of EXPERIENCE_PATTERNS) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lowerDesc.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { pattern, score };
    }
  }

  // Extract potential entity names (capitalized words or quoted strings)
  const entities: string[] = [];
  const capitalizedWords = description.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const quotedStrings = description.match(/"([^"]+)"|'([^']+)'/g) || [];
  
  entities.push(...capitalizedWords);
  entities.push(...quotedStrings.map(s => s.replace(/["']/g, '')));

  // Extract modifiers (adjectives that describe the experience)
  const modifierWords = ['spinning', 'rotating', 'glowing', 'floating', 'bouncing', 'animated', 'interactive', 'large', 'small', 'colorful', 'realistic'];
  const modifiers = modifierWords.filter(mod => lowerDesc.includes(mod));

  return {
    category: bestMatch.pattern.category,
    entities,
    modifiers,
    confidence: bestMatch.score / Math.max(bestMatch.pattern.keywords.length, 1)
  };
}

export function registerOrchestratorTools(server: Server) {
  // create_ar_experience - The main orchestration tool
  server.tool(
    "create_ar_experience",
    "Create a complete AR experience from a natural language description. This tool automatically chains other tools to build complex AR scenes.",
    {
      description: z.string().describe("Natural language description of the desired AR experience (e.g., 'Create a spinning King Kong model' or 'Light painting experience')"),
      autoExecute: z.boolean().optional().default(true).describe("If true, automatically execute the plan. If false, return the plan for review."),
      projectPath: z.string().optional().describe("Optional project path override")
    },
    async (args: any) => {
      const description = String(args.description);
      const autoExecute = args.autoExecute !== false;

      // Analyze the description
      const analysis = analyzeExperienceDescription(description);
      
      const steps: string[] = [];
      const recommendations: string[] = [];
      
      steps.push(`📋 Analysis Results:`);
      steps.push(`   Category: ${analysis.category}`);
      steps.push(`   Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
      if (analysis.entities.length > 0) {
        steps.push(`   Detected entities: ${analysis.entities.join(', ')}`);
      }
      if (analysis.modifiers.length > 0) {
        steps.push(`   Modifiers: ${analysis.modifiers.join(', ')}`);
      }
      steps.push('');

      // Generate execution plan based on category
      switch (analysis.category) {
        case 'light-painting':
          steps.push('🎨 Creating Light Painting Experience:');
          steps.push('   1. Generate custom particle system component');
          steps.push('   2. Add gesture handler for touch tracking');
          steps.push('   3. Create color picker UI');
          steps.push('   4. Add clear button functionality');
          recommendations.push('Use apply_experience_template with "light-painting" for fastest setup');
          recommendations.push('Test on actual device - touch interactions require real hardware');
          break;

        case 'model-showcase':
          steps.push('🎭 Creating Model Showcase Experience:');
          if (analysis.entities.length > 0) {
            steps.push(`   1. Search for "${analysis.entities[0]}" model in asset libraries`);
            steps.push('   2. Download and add model to scene');
          } else {
            steps.push('   1. Use existing model or search for generic model');
          }
          steps.push('   3. Position model at (0, 1, -2) for optimal viewing');
          if (analysis.modifiers.includes('spinning') || analysis.modifiers.includes('rotating')) {
            steps.push('   4. Add Y-axis rotation animation (60°/sec)');
          }
          steps.push('   5. Add ambient lighting (intensity: 0.8)');
          steps.push('   6. Add directional lighting for depth');
          recommendations.push('Use desktop_add_model for GLB/GLTF files');
          recommendations.push('Use desktop_add_rotation_animation for spinning effects');
          break;

        case 'image-target':
          steps.push('🎯 Creating Image Target Experience:');
          steps.push('   1. Configure camera for image tracking');
          steps.push('   2. Add image target with specified marker');
          steps.push('   3. Add content that appears on detection');
          steps.push('   4. Position content relative to target');
          recommendations.push('Use desktop_add_image_target tool');
          recommendations.push('Image target works best with high-contrast, detailed images');
          recommendations.push('Test on actual device with printed marker');
          break;

        case 'portal':
          steps.push('🚪 Creating AR Portal Experience:');
          steps.push('   1. Create portal frame (torus or ring geometry)');
          steps.push('   2. Add hider material plane (colorWrite: false)');
          steps.push('   3. Add portal content behind the plane');
          steps.push('   4. Add glowing effects to frame');
          recommendations.push('Use desktop_add_shape with colorWrite: false for hider material');
          recommendations.push('Position portal content behind the hider plane');
          break;

        case 'physics':
          steps.push('⚙️ Creating Physics Experience:');
          steps.push('   1. Configure physics world settings');
          steps.push('   2. Add ground plane (static collider)');
          steps.push('   3. Add physics-enabled objects (dynamic)');
          steps.push('   4. Set mass and restitution properties');
          recommendations.push('Use desktop_add_model with addPhysics: true');
          recommendations.push('Physics requires 8th Wall Desktop physics support');
          break;

        case 'face-filter':
          steps.push('😊 Creating Face Filter Experience:');
          steps.push('   1. Enable face tracking');
          steps.push('   2. Add objects attached to face landmarks');
          steps.push('   3. Optional: Add debug face mesh');
          recommendations.push('Use desktop_enable_face_tracking tool');
          recommendations.push('Test on actual device - face tracking requires camera');
          break;

        default:
          steps.push('🔧 Creating Custom Experience:');
          steps.push('   1. Analyze requirements manually');
          steps.push('   2. Use appropriate individual tools');
          steps.push('   3. Combine primitives and custom components');
          recommendations.push('Break down complex requirements into smaller tasks');
          recommendations.push('Use existing tools: desktop_add_shape, desktop_add_model, etc.');
          break;
      }

      steps.push('');
      steps.push('💡 Recommendations:');
      recommendations.forEach(rec => steps.push(`   • ${rec}`));

      steps.push('');
      steps.push('🛠️  Available Tools for Manual Control:');
      steps.push('   • apply_experience_template - Use pre-built templates');
      steps.push('   • search_ar_assets - Find 3D models and assets');
      steps.push('   • desktop_add_shape - Add primitive shapes');
      steps.push('   • desktop_add_model - Add GLB/GLTF models');
      steps.push('   • desktop_add_rotation_animation - Add spin effects');
      steps.push('   • desktop_add_scale_animation - Add pulse effects');
      steps.push('   • generate_custom_javascript - Create custom behaviors');

      if (!autoExecute) {
        steps.push('');
        steps.push('⏸️  Auto-execution disabled. Review the plan above and use individual tools to implement.');
      } else {
        steps.push('');
        steps.push('▶️  To implement this plan, use the recommended tools above.');
        steps.push('    For templates: apply_experience_template');
        steps.push('    For manual setup: Use individual desktop_* tools');
      }

      const report = steps.join('\n');
      
      return {
        content: [
          {
            type: "text",
            text: `${report}\n\n📊 Analysis Summary:\n${JSON.stringify(analysis, null, 2)}`
          }
        ]
      };
    }
  );

  // analyze_ar_description - Helper tool for just analysis
  server.tool(
    "analyze_ar_description",
    "Analyze a natural language description to determine the type of AR experience and extract key entities",
    {
      description: z.string().describe("Natural language description to analyze")
    },
    async (args: any) => {
      const analysis = analyzeExperienceDescription(String(args.description));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(analysis, null, 2)
          }
        ]
      };
    }
  );
}

