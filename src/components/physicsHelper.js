// Pre-built Physics Helper Component for 8th Wall AR
// Simplifies working with physics in AR scenes
// Usage: Add 'physics-helper' component to entities

AFRAME.registerComponent('physics-helper', {
  schema: {
    type: { type: 'string', default: 'dynamic', oneOf: ['static', 'dynamic', 'kinematic'] },
    mass: { type: 'number', default: 1 },
    restitution: { type: 'number', default: 0.5 }, // Bounciness
    friction: { type: 'number', default: 0.5 },
    shape: { type: 'string', default: 'auto', oneOf: ['auto', 'box', 'sphere', 'cylinder'] },
    gravity: { type: 'boolean', default: true },
    debug: { type: 'boolean', default: false }
  },
  
  init: function () {
    // Note: This is a helper that generates the proper structure
    // for 8th Wall Desktop's physics system
    
    this.colliderConfig = this.generateColliderConfig();
    
    // If debug mode, visualize the collider
    if (this.data.debug) {
      this.addDebugVisualization();
    }
    
    console.log('physics-helper: Initialized', this.data.type, 'body');
  },
  
  generateColliderConfig: function () {
    const geometry = this.el.getAttribute('geometry');
    let shape = this.data.shape;
    let dimensions = { width: 1, height: 1, depth: 1, radius: 0.5 };
    
    // Auto-detect shape from geometry if 'auto'
    if (shape === 'auto' && geometry) {
      if (geometry.primitive === 'box') {
        shape = 'box';
        dimensions = {
          width: geometry.width || 1,
          height: geometry.height || 1,
          depth: geometry.depth || 1
        };
      } else if (geometry.primitive === 'sphere') {
        shape = 'sphere';
        dimensions = { radius: geometry.radius || 0.5 };
      } else if (geometry.primitive === 'cylinder') {
        shape = 'cylinder';
        dimensions = {
          radius: geometry.radius || 0.5,
          height: geometry.height || 1
        };
      } else {
        shape = 'box'; // Default fallback
      }
    }
    
    return {
      geometry: {
        type: shape,
        ...dimensions
      },
      type: this.data.type,
      mass: this.data.type === 'static' ? 0 : this.data.mass,
      restitution: this.data.restitution,
      friction: this.data.friction,
      useGravity: this.data.gravity
    };
  },
  
  addDebugVisualization: function () {
    // Create a wireframe visualization of the collider
    const config = this.colliderConfig.geometry;
    let debugGeometry;
    
    if (config.type === 'box') {
      debugGeometry = new THREE.BoxGeometry(
        config.width,
        config.height,
        config.depth
      );
    } else if (config.type === 'sphere') {
      debugGeometry = new THREE.SphereGeometry(config.radius, 16, 12);
    } else if (config.type === 'cylinder') {
      debugGeometry = new THREE.CylinderGeometry(
        config.radius,
        config.radius,
        config.height,
        16
      );
    }
    
    if (debugGeometry) {
      const debugMaterial = new THREE.MeshBasicMaterial({
        color: this.data.type === 'static' ? 0x00ff00 : 0xff0000,
        wireframe: true,
        opacity: 0.5,
        transparent: true
      });
      
      const debugMesh = new THREE.Mesh(debugGeometry, debugMaterial);
      this.el.object3D.add(debugMesh);
      this.debugMesh = debugMesh;
    }
  },
  
  getColliderConfig: function () {
    return this.colliderConfig;
  },
  
  applyForce: function (force) {
    // Emit event that physics system can listen to
    this.el.emit('physics-force', {
      force: force,
      body: this.el
    });
  },
  
  applyImpulse: function (impulse) {
    // Emit event that physics system can listen to
    this.el.emit('physics-impulse', {
      impulse: impulse,
      body: this.el
    });
  },
  
  remove: function () {
    if (this.debugMesh) {
      this.el.object3D.remove(this.debugMesh);
    }
  }
});

// Physics World System
AFRAME.registerSystem('physics-helper', {
  schema: {
    gravity: { type: 'vec3', default: { x: 0, y: -9.8, z: 0 } },
    enabled: { type: 'boolean', default: true }
  },
  
  init: function () {
    this.bodies = [];
    console.log('physics-helper system: Initialized with gravity', this.data.gravity);
  },
  
  registerBody: function (el) {
    if (!this.bodies.includes(el)) {
      this.bodies.push(el);
    }
  },
  
  unregisterBody: function (el) {
    const index = this.bodies.indexOf(el);
    if (index > -1) {
      this.bodies.splice(index, 1);
    }
  },
  
  tick: function (time, deltaTime) {
    if (!this.data.enabled) return;
    
    // Simple physics simulation (for demo/debug purposes)
    // In production, 8th Wall Desktop handles physics
  }
});

