# 8th Wall Desktop: Three.js ONLY (No A-Frame)

## Critical Understanding

**8th Wall Desktop uses Three.js directly. A-Frame is NOT used and NOT needed.**

### The Problem

The MCP server was incorrectly generating A-Frame components for Desktop projects, causing:
- `ReferenceError: AFRAME is not defined` 
- `TypeError: null is not an object (evaluating 'scene.components')`
- Webpack disconnection issues

### The Solution

**For 8th Wall Desktop (`.expanse.json` projects):**
- ❌ NO A-Frame components
- ❌ NO `AFRAME.registerComponent()`
- ✅ Pure Three.js code
- ✅ Direct Three.js API usage

### Project Detection

**Desktop Project** = Has `.expanse.json` file
- Uses Three.js directly
- Managed by 8th Wall Desktop app
- No HTML scaffolding needed

**Web Project** = Has `index.html` file
- Can use A-Frame OR Three.js
- Requires HTML setup
- Runs in browser

### Correct Code Generation

#### For Desktop (.expanse.json):
```javascript
// Pure Three.js - no AFRAME
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

#### For Web (index.html with A-Frame):
```javascript
// A-Frame component (only for web projects)
AFRAME.registerComponent('my-component', {
  init: function() {
    // Component code
  }
});
```

### Files That Need Updating

1. **`src/components/`** - These A-Frame components should NOT be used for Desktop
   - particleSystem.js ❌ Desktop
   - gestureHandler.js ❌ Desktop  
   - audioController.js ❌ Desktop
   - physicsHelper.js ❌ Desktop

2. **`src/tools/desktopComponents.ts`** - Currently generates A-Frame, should generate Three.js

3. **`src/tools/codeGenerator.ts`** - Should detect Desktop projects and skip A-Frame

### Desktop Tools That Work Correctly

These tools properly generate Three.js for Desktop:
- ✅ `desktop_add_shape` - Adds geometry to .expanse.json
- ✅ `desktop_add_model` - Adds 3D models
- ✅ `desktop_add_threejs_script` - Generates pure Three.js scripts
- ✅ `desktop_add_animation` - Three.js animations

### Fix Required

1. **Remove A-Frame dependency for Desktop projects**
2. **Generate Three.js-based particle systems, gestures, etc. for Desktop**
3. **Keep A-Frame components only for web projects**

### Example: Correct Particle System for Desktop

```javascript
// desktop-particle-system.js - Pure Three.js
export function createParticleSystem(scene) {
  const particleCount = 1000;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.05
  });
  
  const particleSystem = new THREE.Points(particles, material);
  scene.add(particleSystem);
  
  return particleSystem;
}
```

## Action Plan

1. ✅ Detect if project has `.expanse.json`
2. ✅ If Desktop: Generate Three.js code ONLY
3. ✅ If Web: Allow A-Frame OR Three.js
4. ❌ Never mix A-Frame with Desktop projects

---

**Bottom Line**: If you're working with 8th Wall Desktop, forget A-Frame exists. Use pure Three.js.

