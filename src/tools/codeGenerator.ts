import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type Server = McpServer;

// Safe AFRAME wrapper that checks for existence and waits for load
const SAFE_AFRAME_WRAPPER = `
// Safe AFRAME registration - waits for load and checks existence
(function() {
  console.log('[MCP] Checking AFRAME availability...');
  
  function safeRegister() {
    if (typeof AFRAME === 'undefined') {
      console.error('[MCP] AFRAME is not defined. Using Three.js instead.');
      console.log('[MCP] If you need A-Frame, add: <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>');
      return false;
    }
    console.log('[MCP] AFRAME detected, registering component...');
    return true;
  }
  
  function registerComponent() {
    if (!safeRegister()) return;
    
    try {
`;

const SAFE_AFRAME_WRAPPER_END = `
      console.log('[MCP] Component registered successfully');
    } catch (error) {
      console.error('[MCP] Error registering component:', error);
    }
  }
  
  // Wait for window load event
  if (document.readyState === 'complete') {
    console.log('[MCP] Document already loaded, registering immediately');
    registerComponent();
  } else {
    console.log('[MCP] Waiting for window load event...');
    window.addEventListener('load', function() {
      console.log('[MCP] Window loaded, registering component');
      setTimeout(registerComponent, 100); // Small delay to ensure scene is ready
    });
  }
})();
`;

// Component templates for common patterns
const COMPONENT_TEMPLATES = {
  'particle-system': `${SAFE_AFRAME_WRAPPER}AFRAME.registerComponent('particle-system', {
  schema: {
    maxParticles: { type: 'number', default: 500 },
    particleSize: { type: 'number', default: 0.01 },
    color: { type: 'color', default: '#FFD700' },
    fadeTime: { type: 'number', default: 5000 }
  },
  
  init: function () {
    this.particles = [];
    this.particlePool = [];
    this.particleGeometry = new THREE.SphereGeometry(this.data.particleSize, 8, 8);
    this.particleMaterial = new THREE.MeshBasicMaterial({
      color: this.data.color,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    this.particleContainer = new THREE.Object3D();
    this.el.sceneEl.object3D.add(this.particleContainer);
  },
  
  createParticle: function (position, color) {
    let particleMesh;
    if (this.particlePool.length > 0) {
      particleMesh = this.particlePool.pop();
      particleMesh.position.copy(position);
      particleMesh.material.color.set(color || this.data.color);
      particleMesh.material.opacity = 1;
      particleMesh.visible = true;
    } else {
      particleMesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
      particleMesh.position.copy(position);
      this.particleContainer.add(particleMesh);
    }
    
    this.particles.push({
      mesh: particleMesh,
      creationTime: this.el.sceneEl.time
    });
    
    if (this.particles.length > this.data.maxParticles) {
      this.removeParticle(this.particles[0]);
    }
  },
  
  removeParticle: function (particle) {
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
      particle.mesh.visible = false;
      this.particlePool.push(particle.mesh);
    }
  },
  
  tick: function (time) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const age = time - particle.creationTime;
      if (age > this.data.fadeTime) {
        this.removeParticle(particle);
      } else if (age > this.data.fadeTime * 0.7) {
        particle.mesh.material.opacity = (this.data.fadeTime - age) / (this.data.fadeTime * 0.3);
      }
    }
  },
  
  clearAll: function () {
    while (this.particles.length > 0) {
      this.removeParticle(this.particles[0]);
    }
  }
});${SAFE_AFRAME_WRAPPER_END}`,

  'gesture-handler': `${SAFE_AFRAME_WRAPPER}AFRAME.registerComponent('gesture-handler', {
  schema: {
    enabled: { type: 'boolean', default: true },
    preventDefault: { type: 'boolean', default: true }
  },
  
  init: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    
    this.el.sceneEl.addEventListener('touchstart', this.onTouchStart);
    this.el.sceneEl.addEventListener('touchmove', this.onTouchMove);
    this.el.sceneEl.addEventListener('touchend', this.onTouchEnd);
    
    this.raycaster = new THREE.Raycaster();
    this.touch = new THREE.Vector2();
  },
  
  onTouchStart: function (evt) {
    if (!this.data.enabled) return;
    if (this.data.preventDefault) evt.preventDefault();
    
    const touch = evt.touches[0];
    this.updateTouchVector(touch);
    
    this.el.emit('gesture-start', {
      position: this.touch,
      worldPosition: this.getWorldPosition(this.touch)
    });
  },
  
  onTouchMove: function (evt) {
    if (!this.data.enabled) return;
    if (this.data.preventDefault) evt.preventDefault();
    
    const touch = evt.touches[0];
    this.updateTouchVector(touch);
    
    this.el.emit('gesture-move', {
      position: this.touch,
      worldPosition: this.getWorldPosition(this.touch)
    });
  },
  
  onTouchEnd: function (evt) {
    if (!this.data.enabled) return;
    if (this.data.preventDefault) evt.preventDefault();
    
    this.el.emit('gesture-end', {});
  },
  
  updateTouchVector: function (touch) {
    this.touch.x = (touch.clientX / window.innerWidth) * 2 - 1;
    this.touch.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  },
  
  getWorldPosition: function (screenPos) {
    const camera = this.el.sceneEl.camera;
    this.raycaster.setFromCamera(screenPos, camera);
    const distance = 0.5; // 50cm in front of camera
    const worldPos = new THREE.Vector3();
    this.raycaster.ray.at(distance, worldPos);
    return worldPos;
  },
  
  remove: function () {
    this.el.sceneEl.removeEventListener('touchstart', this.onTouchStart);
    this.el.sceneEl.removeEventListener('touchmove', this.onTouchMove);
    this.el.sceneEl.removeEventListener('touchend', this.onTouchEnd);
  }
});${SAFE_AFRAME_WRAPPER_END}`,

  'tap-handler': `${SAFE_AFRAME_WRAPPER}AFRAME.registerComponent('tap-handler', {
  schema: {
    event: { type: 'string', default: 'tap' }
  },
  
  init: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    
    this.el.addEventListener('touchstart', this.onTouchStart);
    this.el.addEventListener('touchend', this.onTouchEnd);
    
    this.touchStartTime = 0;
  },
  
  onTouchStart: function (evt) {
    this.touchStartTime = Date.now();
  },
  
  onTouchEnd: function (evt) {
    const touchDuration = Date.now() - this.touchStartTime;
    
    // Consider it a tap if touch duration < 300ms
    if (touchDuration < 300) {
      this.el.emit(this.data.event, { target: this.el });
    }
  },
  
  remove: function () {
    this.el.removeEventListener('touchstart', this.onTouchStart);
    this.el.removeEventListener('touchend', this.onTouchEnd);
  }
});${SAFE_AFRAME_WRAPPER_END}`,

  'audio-controller': `${SAFE_AFRAME_WRAPPER}AFRAME.registerComponent('audio-controller', {
  schema: {
    src: { type: 'string' },
    autoplay: { type: 'boolean', default: false },
    loop: { type: 'boolean', default: false },
    volume: { type: 'number', default: 1.0 }
  },
  
  init: function () {
    this.sound = null;
    this.listener = null;
    
    const camera = this.el.sceneEl.camera;
    if (camera) {
      this.listener = new THREE.AudioListener();
      camera.add(this.listener);
      
      if (this.data.src) {
        this.loadSound(this.data.src);
      }
    }
  },
  
  loadSound: function (url) {
    if (!this.listener) return;
    
    this.sound = new THREE.PositionalAudio(this.listener);
    const loader = new THREE.AudioLoader();
    
    loader.load(url, (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(this.data.loop);
      this.sound.setVolume(this.data.volume);
      this.el.object3D.add(this.sound);
      
      if (this.data.autoplay) {
        this.play();
      }
    });
  },
  
  play: function () {
    if (this.sound && !this.sound.isPlaying) {
      this.sound.play();
    }
  },
  
  pause: function () {
    if (this.sound && this.sound.isPlaying) {
      this.sound.pause();
    }
  },
  
  stop: function () {
    if (this.sound) {
      this.sound.stop();
    }
  },
  
  remove: function () {
    if (this.sound) {
      this.stop();
      this.el.object3D.remove(this.sound);
    }
  }
});${SAFE_AFRAME_WRAPPER_END}`
};

// Validate generated code
function validateJavaScript(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for balanced braces and parentheses
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Syntax error: Mismatched braces (${openBraces} open, ${closeBraces} close)`);
  }
  
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Syntax error: Mismatched parentheses (${openParens} open, ${closeParens} close)`);
  }
  
  // Check for common dangerous patterns
  if (code.includes('eval(')) {
    errors.push('Security: eval() is not allowed');
  }
  
  if (code.includes('Function(')) {
    errors.push('Security: Function constructor is not allowed');
  }
  
  // Check for undefined variables (basic check)
  const undefinedAPIs = ['XR9', 'XR7', 'unknownAPI'];
  for (const api of undefinedAPIs) {
    if (code.includes(api)) {
      errors.push(`Warning: Potentially undefined API: ${api}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function registerCodeGeneratorTools(server: Server) {
  // generate_custom_javascript - Main code generation tool
  server.tool(
    "generate_custom_javascript",
    "⚠️ WEB PROJECTS ONLY - NOT FOR DESKTOP! Generate A-Frame components for web-based projects. For Desktop (.expanse.json), use desktop_add_threejs_script instead!",
    {
      description: z.string().describe("Natural language description of the desired behavior"),
      type: z.enum(['component', 'script', 'utility']).default('component').describe("Type of code to generate"),
      componentName: z.string().optional().describe("Name for the component (required if type is 'component')"),
      validate: z.boolean().optional().default(true).describe("Validate generated code before returning"),
      useTemplate: z.string().optional().describe("⚠️ A-Frame templates for WEB only (particle-system, gesture-handler, tap-handler, audio-controller)")
    },
    async (args: any) => {
      const description = String(args.description);
      const type = args.type || 'component';
      const componentName = args.componentName;
      const shouldValidate = args.validate !== false;
      const template = args.useTemplate;
      
      // If template is specified, use it
      if (template && COMPONENT_TEMPLATES[template as keyof typeof COMPONENT_TEMPLATES]) {
        const code = COMPONENT_TEMPLATES[template as keyof typeof COMPONENT_TEMPLATES];
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Using pre-built template: ${template}\n\n\`\`\`javascript\n${code}\n\`\`\`\n\n💡 You can now use desktop_add_custom_component to add this to your project.`
            }
          ]
        };
      }
      
      // Generate code based on description
      let generatedCode = '';
      const lowerDesc = description.toLowerCase();
      
      // Pattern matching for common requests
      if (lowerDesc.includes('particle') || lowerDesc.includes('light paint')) {
        generatedCode = COMPONENT_TEMPLATES['particle-system'];
      } else if (lowerDesc.includes('gesture') || lowerDesc.includes('touch') && lowerDesc.includes('track')) {
        generatedCode = COMPONENT_TEMPLATES['gesture-handler'];
      } else if (lowerDesc.includes('tap') || lowerDesc.includes('click')) {
        generatedCode = COMPONENT_TEMPLATES['tap-handler'];
      } else if (lowerDesc.includes('audio') || lowerDesc.includes('sound')) {
        generatedCode = COMPONENT_TEMPLATES['audio-controller'];
      } else {
        // Generate basic component structure
        const name = componentName || 'custom-component';
        generatedCode = `${SAFE_AFRAME_WRAPPER}AFRAME.registerComponent('${name}', {
  schema: {
    // Define component properties here
    enabled: { type: 'boolean', default: true }
  },
  
  init: function () {
    // Initialize component
    console.log('${name} initialized');
    
    // TODO: Add initialization code based on: ${description}
  },
  
  update: function (oldData) {
    // Called when component properties change
  },
  
  tick: function (time, deltaTime) {
    // Called on each frame (optional)
  },
  
  remove: function () {
    // Cleanup when component is removed
  }
});${SAFE_AFRAME_WRAPPER_END}`;
      }
      
      // Validate if requested
      if (shouldValidate) {
        const validation = validateJavaScript(generatedCode);
        if (!validation.valid) {
          return {
            content: [
              {
                type: "text",
                text: `⚠️  Generated code has validation warnings:\n${validation.errors.join('\n')}\n\nGenerated code:\n\`\`\`javascript\n${generatedCode}\n\`\`\`\n\n💡 Use validate: false to skip validation if you want to use this code anyway.`
              }
            ]
          };
        }
      }
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Generated ${type}:\n\n\`\`\`javascript\n${generatedCode}\n\`\`\`\n\n💡 To add this to your project:\n   Use desktop_add_custom_component with the generated code\n   Or use desktop_add_custom_script for non-component code`
          }
        ]
      };
    }
  );

  // list_code_templates - List available templates
  server.tool(
    "list_code_templates",
    "List all available pre-built code templates",
    async () => {
      const templates = Object.keys(COMPONENT_TEMPLATES);
      const descriptions: Record<string, string> = {
        'particle-system': 'Create and manage 3D particles with fading effects',
        'gesture-handler': 'Handle touch gestures and convert to 3D world positions',
        'tap-handler': 'Detect tap/click events on objects',
        'audio-controller': 'Play spatial audio attached to objects'
      };
      
      const output = templates.map(t => 
        `📦 ${t}\n   ${descriptions[t] || 'No description'}\n   Usage: generate_custom_javascript with useTemplate: "${t}"`
      ).join('\n\n');
      
      return {
        content: [
          {
            type: "text",
            text: `Available code templates:\n\n${output}`
          }
        ]
      };
    }
  );

  // validate_javascript - Standalone validation tool
  server.tool(
    "validate_javascript",
    "Validate JavaScript code for common errors and security issues",
    {
      code: z.string().describe("JavaScript code to validate")
    },
    async (args: any) => {
      const code = String(args.code);
      const validation = validateJavaScript(code);
      
      if (validation.valid) {
        return {
          content: [
            {
              type: "text",
              text: "✅ Code validation passed! No errors detected."
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `❌ Code validation failed:\n\n${validation.errors.join('\n')}`
            }
          ],
          isError: true
        };
      }
    }
  );
}

