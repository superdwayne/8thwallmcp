// Pre-built Gesture Handler Component for 8th Wall AR
// Handles touch gestures and converts them to 3D world positions
// Usage: Add 'gesture-handler' component to your <a-scene>
// Emits: 'gesture-start', 'gesture-move', 'gesture-end' events

// Safe AFRAME registration
(function() {
  console.log('[MCP] Checking AFRAME availability for gesture-handler...');
  function safeRegister() {
    if (typeof AFRAME === 'undefined') {
      console.error('[MCP] AFRAME is not defined. Please add A-Frame script tag.');
      return false;
    }
    console.log('[MCP] AFRAME detected, registering gesture-handler...');
    return true;
  }
  function registerComponent() {
    if (!safeRegister()) return;
    try {

AFRAME.registerComponent('gesture-handler', {
  schema: {
    enabled: { type: 'boolean', default: true },
    preventDefault: { type: 'boolean', default: true },
    distance: { type: 'number', default: 0.5 }, // Distance from camera in meters
    minMoveDistance: { type: 'number', default: 0.001 } // Minimum movement to trigger move event
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
    this.dummyCamera = new THREE.PerspectiveCamera();
    this.lastWorldPosition = null;
    this.isActive = false;
  },
  
  onTouchStart: function (evt) {
    if (!this.data.enabled) return;
    if (this.data.preventDefault) evt.preventDefault();
    
    if (evt.touches.length > 0) {
      const touch = evt.touches[0];
      this.updateTouchVector(touch);
      const worldPos = this.getWorldPosition(this.touch);
      
      this.isActive = true;
      this.lastWorldPosition = worldPos.clone();
      
      this.el.emit('gesture-start', {
        screenPosition: { x: this.touch.x, y: this.touch.y },
        worldPosition: worldPos
      });
    }
  },
  
  onTouchMove: function (evt) {
    if (!this.data.enabled || !this.isActive) return;
    if (this.data.preventDefault) evt.preventDefault();
    
    if (evt.touches.length > 0) {
      const touch = evt.touches[0];
      this.updateTouchVector(touch);
      const worldPos = this.getWorldPosition(this.touch);
      
      // Check if moved enough to trigger event
      if (this.lastWorldPosition) {
        const distance = worldPos.distanceTo(this.lastWorldPosition);
        if (distance < this.data.minMoveDistance) {
          return; // Not enough movement
        }
      }
      
      this.lastWorldPosition = worldPos.clone();
      
      this.el.emit('gesture-move', {
        screenPosition: { x: this.touch.x, y: this.touch.y },
        worldPosition: worldPos
      });
    }
  },
  
  onTouchEnd: function (evt) {
    if (!this.data.enabled || !this.isActive) return;
    if (this.data.preventDefault) evt.preventDefault();
    
    this.isActive = false;
    this.lastWorldPosition = null;
    
    this.el.emit('gesture-end', {});
  },
  
  updateTouchVector: function (touch) {
    this.touch.x = (touch.clientX / window.innerWidth) * 2 - 1;
    this.touch.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  },
  
  getWorldPosition: function (screenPos) {
    const camera = this.el.sceneEl.camera;
    if (!camera) return new THREE.Vector3();
    
    // Update dummy camera for raycasting
    this.dummyCamera.projectionMatrix.copy(camera.projectionMatrix);
    this.dummyCamera.matrixWorld.copy(camera.matrixWorld);
    
    this.raycaster.setFromCamera(screenPos, this.dummyCamera);
    
    // Position at specified distance from camera
    const worldPos = new THREE.Vector3();
    this.raycaster.ray.at(this.data.distance, worldPos);
    return worldPos;
  },
  
  remove: function () {
    this.el.sceneEl.removeEventListener('touchstart', this.onTouchStart);
    this.el.sceneEl.removeEventListener('touchmove', this.onTouchMove);
    this.el.sceneEl.removeEventListener('touchend', this.onTouchEnd);
  }
});

      console.log('[MCP] gesture-handler registered successfully');
    } catch (error) {
      console.error('[MCP] Error registering gesture-handler:', error);
    }
  }
  if (document.readyState === 'complete') {
    registerComponent();
  } else {
    window.addEventListener('load', function() {
      setTimeout(registerComponent, 100);
    });
  }
})();

