#!/usr/bin/env node

/**
 * Standalone script to add shapes to 8th Wall .expanse.json
 * Usage: node add-shape.js <project-path> <shape-type> <name> <x> <y> <z> [color]
 * Example: node add-shape.js "/Users/dwayne/Documents/8th Wall/fire4" cube "Green Cube" 1 0.5 -2 "#00FF00"
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 6) {
  console.log('Usage: node add-shape.js <project-path> <shape-type> <name> <x> <y> <z> [color]');
  console.log('Shape types: cube/box, sphere, cylinder, cone, plane');
  console.log('Example: node add-shape.js "/Users/dwayne/Documents/8th Wall/fire4" cube "Green Cube" 1 0.5 -2 "#00FF00"');
  process.exit(1);
}

const [projectPath, shapeType, shapeName, x, y, z, color = '#FFFFFF'] = args;

const expansePath = path.join(projectPath, 'src', '.expanse.json');

// Check if file exists
if (!fs.existsSync(expansePath)) {
  console.error(`Error: .expanse.json not found at ${expansePath}`);
  process.exit(1);
}

// Read the file
const data = JSON.parse(fs.readFileSync(expansePath, 'utf-8'));

// Generate unique ID
const id = `${shapeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;

// Get space ID
const spaceId = data.entrySpaceId || Object.keys(data.spaces || {})[0];

// Create geometry based on shape type
let geometry;
switch (shapeType.toLowerCase()) {
  case 'cube':
  case 'box':
    geometry = {
      type: 'box',
      width: 1,
      height: 1,
      depth: 1
    };
    break;
  case 'sphere':
    geometry = {
      type: 'sphere',
      radius: 0.5,
      widthSegments: 32,
      heightSegments: 16
    };
    break;
  case 'cylinder':
    geometry = {
      type: 'cylinder',
      radiusTop: 0.5,
      radiusBottom: 0.5,
      height: 1,
      radialSegments: 16
    };
    break;
  case 'cone':
    geometry = {
      type: 'cone',
      radius: 0.5,
      height: 1,
      radialSegments: 16
    };
    break;
  case 'plane':
    geometry = {
      type: 'plane',
      width: 1,
      height: 1
    };
    break;
  default:
    console.error(`Unknown shape type: ${shapeType}`);
    process.exit(1);
}

// Create the new object
const newObject = {
  components: {},
  geometry,
  id,
  material: {
    color: color.toUpperCase(),
    type: 'Standard',
    side: 'Front',
    opacity: 1,
    roughness: 0.5,
    metalness: 0
  },
  name: shapeName,
  position: [parseFloat(x), parseFloat(y), parseFloat(z)],
  rotation: [0, 0, 0, 1],
  scale: [1, 1, 1],
  parentId: spaceId,
  order: Date.now() / 1000000
};

// Add to objects
data.objects[id] = newObject;

// Write back
fs.writeFileSync(expansePath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✅ Added ${shapeType} "${shapeName}" to .expanse.json`);
console.log(`   ID: ${id}`);
console.log(`   Position: [${x}, ${y}, ${z}]`);
console.log(`   Color: ${color}`);
console.log(`   Material: Standard`);





