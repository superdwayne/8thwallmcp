# Three.js Script Template Tool

## Overview

Based on lessons learned from debugging 8th Wall Desktop projects, this tool creates properly structured Three.js scripts that work correctly with 8th Wall Desktop ECS v2.

## What We Learned

### Key Discoveries:
1. **XR8.Threejs.pipelineModule() is required** - You must add it before your custom module
2. **xrScene() returns a wrapper** - Contains `.scene`, `.camera`, `.renderer` properties
3. **Use the real objects** - Extract `xrScene().scene` and `xrScene().camera`
4. **Initialize in onUpdate** - Check every frame until scene/camera are ready
5. **Name your objects** - Prevents 8th Wall Desktop inspector errors

## Usage

### Basic Script

```
You: Use desktop_add_threejs_script with scriptName "my-effect"
```

Creates a minimal working script with:
- ✅ Proper XR8 pipeline setup
- ✅ Correct scene/camera access
- ✅ onUpdate callback for per-frame logic
- ✅ Automatic .expanse.json registration

### With Test Sphere

```
You: Use desktop_add_threejs_script with:
- scriptName: "test-scene"
- addTestSphere: true
```

Adds a green sphere 0.5m in front of the camera to verify it's working.

### With Touch Handling

```
You: Use desktop_add_threejs_script with:
- scriptName: "interactive"
- addTouchHandling: true
```

Includes touch/mouse event listeners ready to use.

### Full Example

```
You: Use desktop_add_threejs_script with:
- scriptName: "particle-effect"
- description: "Creates glowing particles on touch"
- addTestSphere: true
- addTouchHandling: true
- directory: "src"
```

## Generated Script Structure

```javascript
// Proper initialization
window.addEventListener('xrloaded', () => {
  XR8.addCameraPipelineModules([
    XR8.Threejs.pipelineModule(),  // ← CRITICAL!
    myModule
  ]);
});

// Correct scene access
function tryInitialize() {
  let xrSceneWrapper = XR8.Threejs.xrScene();
  
  // Extract real Three.js objects
  scene = xrSceneWrapper.scene;    // ← Real Scene object
  camera = xrSceneWrapper.camera;  // ← Real Camera object
}
```

## Common Issues Solved

### ❌ Before (Broken):
```javascript
// Missing pipeline module
XR8.addCameraPipelineModule(myModule);

// Wrong scene access
scene = XR8.Threejs.xrScene();  // ← Returns wrapper!
camera = scene.children.find(...);  // ← Scene has no children
```

### ✅ After (Working):
```javascript
// With Threejs pipeline
XR8.addCameraPipelineModules([
  XR8.Threejs.pipelineModule(),
  myModule
]);

// Correct scene access
let wrapper = XR8.Threejs.xrScene();
scene = wrapper.scene;    // ← Actual Scene
camera = wrapper.camera;  // ← Actual Camera
```

## Features

- ✅ **Proper Pipeline Setup** - Includes XR8.Threejs.pipelineModule()
- ✅ **Correct Scene Access** - Uses xrScene().scene and .camera
- ✅ **Safe Initialization** - Waits for scene to be ready
- ✅ **Named Objects** - Prevents inspector errors
- ✅ **Auto-Registration** - Adds script to .expanse.json
- ✅ **Working Examples** - Test sphere and touch handling options

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scriptName` | string | required | Name of the script file |
| `description` | string | optional | Description comment |
| `addTestSphere` | boolean | false | Add a test sphere to verify |
| `addTouchHandling` | boolean | false | Include touch/mouse events |
| `directory` | string | "src" | Directory to create script in |

## Examples in Action

### Particle System
```javascript
// In setupScene():
const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const particleMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthTest: false
});

const particle = new THREE.Mesh(particleGeometry, particleMaterial);
particle.name = 'Particle';
scene.add(particle);
```

### Light Effect
```javascript
// In setupScene():
const light = new THREE.PointLight(0xff0000, 1, 100);
light.name = 'RedLight';
light.position.set(0, 0, -0.5);
scene.add(light);
```

## Troubleshooting

### "xrScene() returns null"
- ✅ Check XR8.Threejs.pipelineModule() is added first
- ✅ Initialize in onUpdate callback, not immediately

### "scene.add is not a function"
- ✅ Make sure you're using `xrScene().scene`, not xrScene() directly

### "Cannot read properties of undefined"
- ✅ Add proper `.name` properties to all Three.js objects

## Next Steps

1. Create your script with `desktop_add_threejs_script`
2. Test in 8th Wall Desktop
3. Customize the setupScene() function
4. Add your Three.js effects!

## Related Tools

- `desktop_add_shape` - Add primitive shapes to .expanse.json
- `desktop_add_model` - Add GLB/GLTF models
- `project_write_file` - Create custom scripts manually

---

**This tool captures the hard-won knowledge from debugging real 8th Wall Desktop projects!** 🎉

