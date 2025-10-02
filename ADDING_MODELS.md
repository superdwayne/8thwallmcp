# Adding 3D Models to 8th Wall Desktop Projects

## Using the `desktop_add_model` Tool

The MCP server now includes a powerful tool to add 3D models (GLB/GLTF files) from your assets folder to your 8th Wall Desktop scene.

## Basic Usage

```
Use desktop_add_model with:
- name: "My Model"
- assetPath: "assets/model.glb"
```

## Parameters

### Required:
- **name** (string): Display name for the model in the scene
- **assetPath** (string): Path to the GLB/GLTF file (e.g., "assets/8.glb")

### Optional:
- **position** ([x, y, z]): Position in 3D space (default: [0, 0, 0])
- **rotation** ([x, y, z, w]): Quaternion rotation (default: [0, 0, 0, 1])
- **scale** ([x, y, z]): Scale factors (default: [1, 1, 1])
- **animationClip** (string): Name of animation to play (default: "")
- **loop** (boolean): Loop the animation (default: true)
- **addPhysics** (boolean): Add physics collider (default: false)
- **physicsMass** (number): Mass for physics (default: 1 for dynamic, 0 for static)
- **physicsType** ("static" | "dynamic" | "kinematic"): Type of physics body

## Examples

### Simple Model
```
Add the 8.glb model from assets at position [0, 0, -3]
```

### Model with Animation
```
Use desktop_add_model with:
- name: "Character"
- assetPath: "assets/character.glb"
- position: [0, 0, -2]
- animationClip: "Walk"
- loop: true
```

### Model with Physics
```
Use desktop_add_model with:
- name: "Box Model"
- assetPath: "assets/box.glb"
- position: [0, 2, -3]
- addPhysics: true
- physicsType: "dynamic"
- physicsMass: 5
```

### Static Environment Model
```
Use desktop_add_model with:
- name: "Building"
- assetPath: "assets/building.glb"
- position: [10, 0, -20]
- scale: [2, 2, 2]
- addPhysics: true
- physicsType: "static"
```

### Scaled and Rotated Model
```
Use desktop_add_model with:
- name: "Tree"
- assetPath: "assets/tree.glb"
- position: [5, 0, -10]
- scale: [1.5, 1.5, 1.5]
- rotation: [0, 0.707, 0, 0.707]  # 90 degrees Y rotation
```

## Features

✓ Automatically creates proper model component structure
✓ Supports animations with loop control
✓ Optional physics integration
✓ Flexible positioning, rotation, and scaling
✓ Works with both GLB and GLTF formats
✓ Proper prefab marking for 8th Wall Desktop

## Physics Types

- **static**: Immovable object (e.g., walls, floors, buildings)
- **dynamic**: Falls with gravity, responds to forces (e.g., balls, crates)
- **kinematic**: Can be moved programmatically, doesn't respond to physics (e.g., moving platforms)

## Tips

1. **Place models in assets folder**: Make sure your GLB/GLTF files are in the `src/assets/` directory
2. **Check file paths**: Use relative paths from the project root (e.g., "assets/model.glb")
3. **Physics colliders**: Default collider is a 1x1x1 box - adjust physics geometry if needed
4. **Animations**: Check your model's animation names in a 3D viewer first
5. **Scale**: If model appears too large/small, adjust the scale parameter
6. **Performance**: Models with physics require more processing power

## Troubleshooting

**Model doesn't appear:**
- Check the assetPath is correct
- Verify the GLB file exists in assets folder
- Try adjusting the position to be in front of camera

**Physics not working:**
- Ensure addPhysics is set to true
- Check that there's a ground/floor for dynamic objects to collide with
- Verify physicsMass is appropriate (0 for static, >0 for dynamic)

**Animation not playing:**
- Verify the animationClip name matches your model's animation
- Check that loop is set to true if you want continuous playback
- Some models may need to be triggered programmatically

## Advanced: Combining with Other Tools

You can combine `desktop_add_model` with other MCP tools:

```
1. Set project to fire10
2. Add ground plane with desktop_add_shape
3. Add model with desktop_add_model and physics
4. The model will fall onto the ground!
```

## Example Workflow

```
# Set up project
Set project root to /Users/dwayne/Documents/8th Wall/fire10

# Add a ground
Use desktop_add_shape with:
- name: "Ground"
- geometryType: "plane"
- position: [0, 0, 0]
- scale: [10, 10, 1]

# Add a model with physics
Use desktop_add_model with:
- name: "Car"
- assetPath: "assets/car.glb"
- position: [0, 5, -5]
- addPhysics: true
- physicsType: "dynamic"
- physicsMass: 10

# The car will fall onto the ground!
```



