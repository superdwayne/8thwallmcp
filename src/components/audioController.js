// Pre-built Audio Controller Component for 8th Wall AR
// Handles spatial audio playback in AR scenes
// Usage: Add 'audio-controller' component to an entity

// Safe AFRAME registration
(function() {
  console.log('[MCP] Checking AFRAME availability for audio-controller...');
  function safeRegister() {
    if (typeof AFRAME === 'undefined') {
      console.error('[MCP] AFRAME is not defined. Please add A-Frame script tag.');
      return false;
    }
    console.log('[MCP] AFRAME detected, registering audio-controller...');
    return true;
  }
  function registerComponent() {
    if (!safeRegister()) return;
    try {

AFRAME.registerComponent('audio-controller', {
  schema: {
    src: { type: 'string', default: '' },
    autoplay: { type: 'boolean', default: false },
    loop: { type: 'boolean', default: false },
    volume: { type: 'number', default: 1.0 },
    refDistance: { type: 'number', default: 1 },
    rolloffFactor: { type: 'number', default: 1 },
    spatial: { type: 'boolean', default: true }
  },
  
  init: function () {
    this.sound = null;
    this.listener = null;
    this.isReady = false;
    
    // Get or create audio listener on camera
    const camera = this.el.sceneEl.camera;
    if (camera) {
      // Check if listener already exists
      this.listener = camera.children.find(child => child instanceof THREE.AudioListener);
      
      if (!this.listener) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
      }
      
      if (this.data.src) {
        this.loadSound(this.data.src);
      }
    } else {
      console.warn('audio-controller: Camera not found, waiting...');
      // Retry when scene is loaded
      this.el.sceneEl.addEventListener('camera-set-active', () => {
        this.init();
      });
    }
  },
  
  update: function (oldData) {
    // If src changed, reload sound
    if (this.data.src !== oldData.src && this.data.src) {
      this.loadSound(this.data.src);
    }
    
    // Update volume
    if (this.sound && this.data.volume !== oldData.volume) {
      this.sound.setVolume(this.data.volume);
    }
    
    // Update loop
    if (this.sound && this.data.loop !== oldData.loop) {
      this.sound.setLoop(this.data.loop);
    }
    
    // Update spatial settings
    if (this.sound && this.data.spatial) {
      if (this.data.refDistance !== oldData.refDistance) {
        this.sound.setRefDistance(this.data.refDistance);
      }
      if (this.data.rolloffFactor !== oldData.rolloffFactor) {
        this.sound.setRolloffFactor(this.data.rolloffFactor);
      }
    }
  },
  
  loadSound: function (url) {
    if (!this.listener) {
      console.error('audio-controller: No audio listener available');
      return;
    }
    
    // Remove old sound if exists
    if (this.sound) {
      this.stop();
      this.el.object3D.remove(this.sound);
    }
    
    // Create appropriate audio type
    if (this.data.spatial) {
      this.sound = new THREE.PositionalAudio(this.listener);
      this.sound.setRefDistance(this.data.refDistance);
      this.sound.setRolloffFactor(this.data.rolloffFactor);
    } else {
      this.sound = new THREE.Audio(this.listener);
    }
    
    const loader = new THREE.AudioLoader();
    
    loader.load(
      url,
      (buffer) => {
        this.sound.setBuffer(buffer);
        this.sound.setLoop(this.data.loop);
        this.sound.setVolume(this.data.volume);
        this.el.object3D.add(this.sound);
        this.isReady = true;
        
        this.el.emit('sound-loaded', { src: url });
        
        if (this.data.autoplay) {
          this.play();
        }
      },
      (progress) => {
        // Loading progress
      },
      (error) => {
        console.error('audio-controller: Error loading audio:', error);
        this.el.emit('sound-error', { src: url, error });
      }
    );
  },
  
  play: function () {
    if (this.sound && !this.sound.isPlaying && this.isReady) {
      this.sound.play();
      this.el.emit('sound-play');
    }
  },
  
  pause: function () {
    if (this.sound && this.sound.isPlaying) {
      this.sound.pause();
      this.el.emit('sound-pause');
    }
  },
  
  stop: function () {
    if (this.sound) {
      this.sound.stop();
      this.el.emit('sound-stop');
    }
  },
  
  remove: function () {
    if (this.sound) {
      this.stop();
      this.el.object3D.remove(this.sound);
    }
  }
});

// Add convenience methods to A-Frame elements
AFRAME.registerSystem('audio-controller', {
  init: function () {
    // Global play all
    this.playAll = function () {
      document.querySelectorAll('[audio-controller]').forEach(el => {
        const component = el.components['audio-controller'];
        if (component) component.play();
      });
    };
    
    // Global stop all
    this.stopAll = function () {
      document.querySelectorAll('[audio-controller]').forEach(el => {
        const component = el.components['audio-controller'];
        if (component) component.stop();
      });
    };
  }
});

      console.log('[MCP] audio-controller registered successfully');
    } catch (error) {
      console.error('[MCP] Error registering audio-controller:', error);
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

