// Pre-built Particle System Component for 8th Wall AR
// Creates and manages 3D particles with fading effects
// Usage: Add 'particle-system' component to your <a-scene>

// Safe AFRAME registration - waits for load and checks existence
(function() {
  console.log('[MCP] Checking AFRAME availability for particle-system...');
  
  function safeRegister() {
    if (typeof AFRAME === 'undefined') {
      console.error('[MCP] AFRAME is not defined. Please add A-Frame script tag.');
      console.log('[MCP] Add: <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>');
      return false;
    }
    console.log('[MCP] AFRAME detected, registering particle-system component...');
    return true;
  }
  
  function registerComponent() {
    if (!safeRegister()) return;
    
    try {

AFRAME.registerComponent('particle-system', {
  schema: {
    maxParticles: { type: 'number', default: 500 },
    particleSize: { type: 'number', default: 0.01 },
    color: { type: 'color', default: '#FFD700' },
    fadeTime: { type: 'number', default: 5000 },
    minDistance: { type: 'number', default: 0.02 }
  },
  
  init: function () {
    this.particles = [];
    this.particlePool = [];
    this.activeColor = new THREE.Color(this.data.color);
    
    // Setup particle geometry and material
    this.particleGeometry = new THREE.SphereGeometry(this.data.particleSize, 8, 8);
    this.particleMaterial = new THREE.MeshBasicMaterial({
      color: this.activeColor,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    
    // Create container for particles
    this.particleContainer = new THREE.Object3D();
    this.el.sceneEl.object3D.add(this.particleContainer);
    
    // Track last position for distance checking
    this.lastPosition = null;
  },
  
  createParticle: function (position, color) {
    let particleMesh;
    const particleColor = color || this.activeColor;
    
    if (this.particlePool.length > 0) {
      particleMesh = this.particlePool.pop();
      particleMesh.position.copy(position);
      particleMesh.material.color.copy(particleColor);
      particleMesh.material.opacity = 1;
      particleMesh.visible = true;
    } else {
      particleMesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial.clone());
      particleMesh.position.copy(position);
      particleMesh.material.color.copy(particleColor);
      this.particleContainer.add(particleMesh);
    }
    
    this.particles.push({
      mesh: particleMesh,
      creationTime: this.el.sceneEl.time
    });
    
    // Remove oldest particle if exceeding max
    if (this.particles.length > this.data.maxParticles) {
      this.removeParticle(this.particles[0]);
    }
    
    this.lastPosition = position.clone();
  },
  
  removeParticle: function (particle) {
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
      particle.mesh.visible = false;
      this.particlePool.push(particle.mesh);
    }
  },
  
  tick: function (time, deltaTime) {
    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const age = time - particle.creationTime;
      const remainingLife = this.data.fadeTime - age;
      
      if (remainingLife <= 0) {
        this.removeParticle(particle);
      } else if (remainingLife < this.data.fadeTime * 0.3) {
        // Fade in last 30% of life
        particle.mesh.material.opacity = remainingLife / (this.data.fadeTime * 0.3);
      }
    }
  },
  
  setColor: function (color) {
    this.activeColor.set(color);
  },
  
  clearAll: function () {
    while (this.particles.length > 0) {
      this.removeParticle(this.particles[0]);
    }
  },
  
  remove: function () {
    this.clearAll();
    if (this.particleContainer) {
      this.el.sceneEl.object3D.remove(this.particleContainer);
    }
  }
});

      console.log('[MCP] particle-system component registered successfully');
    } catch (error) {
      console.error('[MCP] Error registering particle-system component:', error);
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

