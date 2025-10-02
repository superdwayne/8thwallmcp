# 🎬 Animation & Interaction Guide

## Overview

The 8th Wall Desktop MCP now supports **3 types of animations** directly in your projects!

All animations work by adding **attributes** to objects in `.expanse.json` - no TypeScript required!

---

## ✅ Available Animation Tools

### 1. **Rotation Animation** - `desktop_add_rotation_animation`

Spin objects continuously around X, Y, or Z axis.

**Parameters:**
- `objectName` (string, required) - Name of the object to animate
- `axis` (enum: "x" | "y" | "z", required) - Axis to rotate around
- `degreesPerSecond` (number, optional, default: 60) - Rotation speed
- `loop` (boolean, optional, default: true) - Loop the animation
- `reverse` (boolean, optional, default: false) - Reverse direction
- `easeIn` (boolean, optional, default: false) - Ease in at start
- `easeOut` (boolean, optional, default: false) - Ease out at end

**Example Usage:**
```
Add rotation animation to "Circle" spinning around Y axis at 90 degrees per second
```

**What it does:**
- Adds `RotateAnimation` attribute to the object
- Calculates duration based on speed (360° / degreesPerSecond)
- Perfect for spinning logos, planets, indicators

---

### 2. **Scale Animation** - `desktop_add_scale_animation`

Create pulsing/breathing effects by animating scale.

**Parameters:**
- `objectName` (string, required) - Name of the object to animate
- `minScale` (number, optional, default: 0.8) - Minimum scale multiplier (not used directly, but implied)
- `maxScale` (number, optional, default: 1.2) - Maximum scale multiplier
- `duration` (number, optional, default: 1) - Duration in seconds for one cycle
- `loop` (boolean, optional, default: true) - Loop the animation
- `reverse` (boolean, optional, default: true) - Reverse (breathe back)
- `easeIn` (boolean, optional, default: true) - Ease in at start
- `easeOut` (boolean, optional, default: true) - Ease out at end

**Example Usage:**
```
Add scale animation to "Sphere" pulsing from 0.9 to 1.1 over 2 seconds
```

**What it does:**
- Adds `ScaleAnimation` attribute to the object
- Uses `autoFrom: true` to start from current scale
- Scales to `maxScale` on all axes (uniform scaling)
- Perfect for attention-grabbing effects, heartbeats, breathing

---

### 3. **Model Animation** - `desktop_set_model_animation`

Control built-in animations in GLB/GLTF models.

**Parameters:**
- `modelName` (string, required) - Name of the model object
- `animationClip` (string, required) - Name of the animation clip (e.g., "idle", "walk", "run")
- `loop` (boolean, optional, default: true) - Loop the animation
- `speed` (number, optional, default: 1) - Playback speed multiplier

**Example Usage:**
```
Set animation clip "walk" on model "Character" with loop enabled and speed 1.5x
```

**What it does:**
- Finds the model's prefab (handles prefab/instance pattern)
- Sets `animationClip`, `loop`, and `speed` on the `gltfModel` property
- Works with any GLB file that has embedded animations

**Notes:**
- You must know the animation clip names in your GLB file
- Use Blender or a GLB viewer to see available animations

---

## 🎯 Workflow

### Step 1: Add Objects
```
Use fire10 project and add a blue sphere at position [0, 2, -3]
```

### Step 2: Add Animation
```
Add rotation animation to "Sphere" around Y axis at 120 degrees per second
```

### Step 3: Test in 8th Wall Desktop
1. Open fire10 in 8th Wall Desktop
2. See the sphere spinning!

---

## 🔧 Technical Details

### How It Works

Animations are stored as **attributes** in `.expanse.json`:

```json
{
  "objects": {
    "sphere-xyz": {
      "name": "Sphere",
      "geometry": {...},
      "material": {...},
      "attributes": {
        "RotateAnimation": {
          "autoFrom": true,
          "toY": 360,
          "duration": 3,
          "loop": true,
          "reverse": false,
          "easeIn": false,
          "easeOut": false,
          "easingFunction": "linear"
        }
      }
    }
  }
}
```

### Combining Animations

**Q: Can I add multiple animations to one object?**  
**A:** Yes! You can combine different animation types:

```json
"attributes": {
  "RotateAnimation": {...},
  "ScaleAnimation": {...}
}
```

This creates complex effects like a spinning, pulsing object!

---

## 🐛 Troubleshooting

### Animation doesn't play
1. **Check object name** - Must match exactly (case-sensitive)
2. **Open in 8th Wall Desktop** - Animations only work in Desktop, not web preview
3. **Restart Desktop** - After adding animations, close and reopen the project

### Model animation not found
1. **Check animation clip name** - Must match exactly what's in the GLB file
2. **Use a GLB viewer** - Open your GLB in Blender or online viewer to see clip names
3. **Check model type** - Only works on objects with `gltfModel`

### Object is a "prefab" error
- If adding animation to a model, use the **instance name** (the visible one)
- The tool automatically finds the prefab and applies animation there

---

## 📚 Examples

### Example 1: Spinning Logo
```
1. Add a circle at [0, 3, -2] with color #FFD700
2. Add rotation animation to "Circle" around Z axis at 45 degrees per second
```

### Example 2: Pulsing Button
```
1. Add a cylinder at [1, 1.5, -2] with color #FF0000
2. Add scale animation to "Cylinder" from 1.0 to 1.15 over 0.8 seconds
```

### Example 3: Animated Character
```
1. Add "character.glb" model at [0, 0, -3]
2. Set animation clip "idle" on model "character.glb" with loop enabled
```

### Example 4: Complex Effect
```
1. Add a sphere at [0, 2, -3] with color #00FFFF
2. Add rotation animation to "Sphere" around Y axis at 90 degrees per second
3. Add scale animation to "Sphere" from 1.0 to 1.1 over 1.5 seconds
Result: Spinning, pulsing sphere!
```

---

## 🚀 Future Enhancements (Not Yet Implemented)

- Click/tap interactions
- Position animations (move objects)
- Custom easing functions
- Animation triggers (on load, on click, etc.)

---

## ✨ Tips

1. **Start simple** - Test one animation at a time
2. **Use descriptive names** - Name objects clearly ("Logo", "Button", "Character")
3. **Adjust speeds** - Start with default speeds, then tweak
4. **Combine effects** - Mix rotation + scale for rich animations
5. **Test in Desktop** - Always verify in 8th Wall Desktop, not web preview

---

**Happy Animating! 🎉**




