import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { getProjectRoot } from "../utils/projectRoot.js";

type Server = any;

function projectRoot(): string {
  return getProjectRoot();
}

async function walkLimit(base: string, maxFiles: number, maxDepth: number): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string, depth: number) {
    if (out.length >= maxFiles) return;
    let entries: any[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch { return; }
    for (const e of entries) {
      if (out.length >= maxFiles) break;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (depth < maxDepth) await walk(full, depth + 1);
      } else {
        out.push(full);
      }
    }
  }
  await walk(base, 0);
  return out;
}

// Helper: Ensure numeric value is valid (no undefined/null/NaN)
function ensureNumber(val: any, fallback: number): number {
  const n = Number(val);
  return (isFinite(n) && !isNaN(n)) ? n : fallback;
}

// Helper: Ensure array of numbers is valid
function ensureVec(val: any, fallback: number[]): number[] {
  if (!Array.isArray(val)) return fallback;
  return val.map((v, i) => ensureNumber(v, fallback[i]));
}

// Helper: Ensure color is valid hex string
function ensureColor(val: any, fallback: string): string {
  if (typeof val === "string" && /^#[0-9A-Fa-f]{6}$/.test(val)) return val;
    return fallback;
}

// Helper: Create template .expanse.json structure
function createTemplateExpanseJson(): any {
  const spaceId = `space-${Date.now()}`;
  return {
    entrySpaceId: spaceId,
    objects: {},
    spaces: {
      [spaceId]: {
        id: spaceId,
        name: "Main Space",
        type: "space"
      }
    },
    runtimeVersion: "1.0.0",
    historyVersion: 1
  };
}

// Helper: Get path to .expanse.json (creates if missing)
async function findExpanseJson(): Promise<string> {
  const root = projectRoot();
  
  // Check root directory first
  const candidateRoot = path.join(root, ".expanse.json");
  try {
    await fs.access(candidateRoot);
    return candidateRoot;
  } catch {
    // If not in root, check src/ subdirectory
    const candidateSrc = path.join(root, "src", ".expanse.json");
    try {
      await fs.access(candidateSrc);
      return candidateSrc;
    } catch {
      // Neither exists - create template in src/.expanse.json
      try {
        // Ensure src/ directory exists
        await fs.mkdir(path.join(root, "src"), { recursive: true });
        
        // Create template .expanse.json
        const template = createTemplateExpanseJson();
        await fs.writeFile(candidateSrc, JSON.stringify(template, null, 2), "utf-8");
        
        return candidateSrc;
      } catch (err) {
        throw new Error(`Could not create .expanse.json: ${err}`);
      }
    }
  }
}

// Helper: Read and parse .expanse.json
async function readExpanseJson(): Promise<any> {
  const p = await findExpanseJson();
  const text = await fs.readFile(p, "utf-8");
  return JSON.parse(text);
}

// Helper: Write .expanse.json
async function writeExpanseJson(data: any): Promise<void> {
  const p = await findExpanseJson();
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

// Helper: Repair object to ensure all required properties
function repairObject(obj: any): any {
  // Ensure components exists
  if (!obj.components || typeof obj.components !== "object") {
    obj.components = {};
  }

  // Ensure position, scale, rotation are valid
  obj.position = ensureVec(obj.position, [0, 0, 0]);
  obj.scale = ensureVec(obj.scale, [1, 1, 1]);
  obj.rotation = ensureVec(obj.rotation, [0, 0, 0]);

  // Repair geometry if it exists - only fix existing properties, don't add unnecessary ones
  if (obj.geometry && typeof obj.geometry === "object") {
    const geo = obj.geometry;
    // Only ensure existing properties are valid, don't add extras
    if ('width' in geo) geo.width = ensureNumber(geo.width, 1);
    if ('height' in geo) geo.height = ensureNumber(geo.height, 1);
    if ('depth' in geo) geo.depth = ensureNumber(geo.depth, 1);
    if ('radius' in geo) geo.radius = ensureNumber(geo.radius, 0.5);
    if ('radiusTop' in geo) geo.radiusTop = ensureNumber(geo.radiusTop, 0.5);
    if ('radiusBottom' in geo) geo.radiusBottom = ensureNumber(geo.radiusBottom, 0.5);
    if ('tube' in geo) geo.tube = ensureNumber(geo.tube, 0.2);
    if ('radialSegments' in geo) geo.radialSegments = ensureNumber(geo.radialSegments, 8);
    if ('widthSegments' in geo) geo.widthSegments = ensureNumber(geo.widthSegments, 32);
    if ('heightSegments' in geo) geo.heightSegments = ensureNumber(geo.heightSegments, 16);
    if ('segments' in geo) geo.segments = ensureNumber(geo.segments, 8);
    if ('openEnded' in geo) geo.openEnded = Boolean(geo.openEnded);
    if ('thetaStart' in geo) geo.thetaStart = ensureNumber(geo.thetaStart, 0);
    if ('thetaLength' in geo) geo.thetaLength = ensureNumber(geo.thetaLength, Math.PI * 2);
    if ('innerRadius' in geo) geo.innerRadius = ensureNumber(geo.innerRadius, 0.5);
    if ('outerRadius' in geo) geo.outerRadius = ensureNumber(geo.outerRadius, 1);
    if ('thetaSegments' in geo) geo.thetaSegments = ensureNumber(geo.thetaSegments, 8);
    if ('phiSegments' in geo) geo.phiSegments = ensureNumber(geo.phiSegments, 8);
    if ('tubularSegments' in geo) geo.tubularSegments = ensureNumber(geo.tubularSegments, 64);
    if ('arc' in geo) geo.arc = ensureNumber(geo.arc, Math.PI * 2);
  }

  // Repair material if it exists
  if (obj.material && typeof obj.material === "object") {
    const mat = obj.material;
    if (!mat.type) mat.type = "basic";
    mat.color = ensureColor(mat.color, "#ffffff");
    // Only add roughness/metalness for standard and phong materials
    if (mat.type === "standard" || mat.type === "phong") {
      mat.roughness = ensureNumber(mat.roughness, 0.5);
      mat.metalness = ensureNumber(mat.metalness, 0.5);
    }
    mat.opacity = ensureNumber(mat.opacity, 1);
    mat.emissiveIntensity = ensureNumber(mat.emissiveIntensity, 0);
    if (mat.emissive) mat.emissive = ensureColor(mat.emissive, "#000000");
  }

  // Repair light if it exists
  if (obj.light && typeof obj.light === "object") {
    const light = obj.light;
    light.intensity = ensureNumber(light.intensity, 1);
    light.color = ensureColor(light.color, "#ffffff");
    if (light.distance !== undefined) light.distance = ensureNumber(light.distance, 0);
    if (light.decay !== undefined) light.decay = ensureNumber(light.decay, 2);
    if (light.angle !== undefined) light.angle = ensureNumber(light.angle, Math.PI / 3);
    if (light.penumbra !== undefined) light.penumbra = ensureNumber(light.penumbra, 0);
  }

  return obj;
}

export function registerDesktopTools(server: Server) {
  // desktop_guess_scene
  server.tool(
    "desktop_guess_scene",
    "Heuristically find scene/config JSON files used by 8th Wall Desktop",
    { maxDepth: z.number().optional(), maxFiles: z.number().optional() },
    async (args: any) => {
      const root = projectRoot();
      const maxDepth = typeof args?.maxDepth === "number" ? Math.max(0, Math.floor(args.maxDepth)) : 5;
      const maxFiles = typeof args?.maxFiles === "number" ? Math.max(1, Math.floor(args.maxFiles)) : 800;
      const files = await walkLimit(root, maxFiles, maxDepth);
      const candidates: { path: string; size: number; keys?: string[]; score: number }[] = [];
      for (const f of files) {
        const ext = path.extname(f).toLowerCase();
        if (ext && ext !== ".json" && ext !== ".scene" && ext !== ".space") continue;
        let st: any; try { st = await fs.stat(f); } catch { continue; }
        if (!st.isFile()) continue;
        if (st.size > 3 * 1024 * 1024) continue; // skip very large files
        let text: string;
        try { text = await fs.readFile(f, "utf-8"); } catch { continue; }
        let obj: any;
        try { obj = JSON.parse(text); } catch { continue; }
        if (!obj || typeof obj !== "object") continue;
        const keys = Object.keys(obj).slice(0, 50);
        let score = 0;
        const inc = (k: string) => { if (k in obj) score += 2; };
        inc("scene"); inc("scenes"); inc("entities"); inc("objects"); inc("nodes"); inc("components"); inc("spaces"); inc("space");
        if (Array.isArray(obj.entities) || Array.isArray(obj.objects) || Array.isArray(obj.nodes)) score += 3;
        if (String(f).toLowerCase().includes("scene") || String(f).toLowerCase().includes("space")) score += 1;
        if (score > 0) candidates.push({ path: path.relative(root, f), size: st.size, keys, score });
      }
      candidates.sort((a,b)=> b.score - a.score || a.path.localeCompare(b.path));
      const result = { root, candidates: candidates.slice(0, 50) };
      return { content: [ { type: "text", text: JSON.stringify(result, null, 2) } ] };
    }
  );

  // desktop_read_json
  server.tool(
    "desktop_read_json",
    "Read .expanse.json with optional JSON Pointer path",
    { pointer: z.string().optional() },
    async (args: any) => {
      const data = await readExpanseJson();
      if (!args.pointer) {
        return { content: [{ type: "json", json: data }] };
      }
      // Simple JSON Pointer implementation
      const parts = String(args.pointer).split("/").filter(Boolean);
      let current = data;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) {
          throw new Error(`Pointer ${args.pointer} not found`);
        }
      }
      return { content: [{ type: "json", json: current }] };
    }
  );

  // desktop_write_json
  server.tool(
    "desktop_write_json",
    "Write entire .expanse.json (replaces file)",
    { data: z.any() },
    async (args: any) => {
      await writeExpanseJson(args.data);
      return { content: [{ type: "text", text: "Wrote .expanse.json" }] };
    }
  );

  // desktop_patch_json
  server.tool(
    "desktop_patch_json",
    "Patch .expanse.json using JSON Pointer (set/remove/push operations)",
    {
      pointer: z.string(),
      op: z.enum(["set", "remove", "push"]),
      value: z.any().optional()
    },
    async (args: any) => {
      const data = await readExpanseJson();
      const pointer = String(args.pointer);
      const parts = pointer.split("/").filter(Boolean);
      
      if (args.op === "remove") {
        let current = data;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
          if (current === undefined) throw new Error(`Path not found: ${pointer}`);
        }
        delete current[parts[parts.length - 1]];
      } else if (args.op === "set") {
        let current = data;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = args.value;
      } else if (args.op === "push") {
        let current = data;
        for (const part of parts) {
          current = current[part];
          if (current === undefined) throw new Error(`Path not found: ${pointer}`);
        }
        if (!Array.isArray(current)) throw new Error(`Target is not an array: ${pointer}`);
        current.push(args.value);
      }
      
      await writeExpanseJson(data);
      return { content: [{ type: "text", text: `Patched .expanse.json (${args.op})` }] };
    }
  );

  // desktop_add_shape
  server.tool(
    "desktop_add_shape",
    "Add a 3D shape to .expanse.json with proper 8th Wall validation",
    {
      name: z.string(),
      geometryType: z.enum(["box", "sphere", "cylinder", "plane", "circle", "cone", "torus", "ring"]),
      position: z.array(z.number()).length(3).optional(),
      rotation: z.array(z.number()).length(3).optional(),
      scale: z.array(z.number()).length(3).optional(),
      color: z.string().optional(),
      materialType: z.enum(["basic", "Basic", "standard", "Standard", "phong", "Phong"]).optional(),
      roughness: z.number().optional(),
      metalness: z.number().optional(),
      opacity: z.number().optional(),
      emissive: z.string().optional(),
      emissiveIntensity: z.number().optional(),
      colorWrite: z.boolean().optional().describe("Set to false for hider/occluder materials (AR portals)"),
      depthWrite: z.boolean().optional().describe("Set to true for hider/occluder materials"),
      depthTest: z.boolean().optional().describe("Set to true for hider/occluder materials"),
      // Geometry-specific properties
      width: z.number().optional(),
      height: z.number().optional(),
      depth: z.number().optional(),
      radius: z.number().optional(),
      radiusTop: z.number().optional(),
      radiusBottom: z.number().optional(),
      tube: z.number().optional(),
      radialSegments: z.number().optional(),
      innerRadius: z.number().optional(),
      outerRadius: z.number().optional()
    },
    async (args: any) => {
      const data = await readExpanseJson();
      
      // Detect structure: new format uses data.objects (object), old format uses data.spaces[0].objects (array)
      const isNewFormat = data.objects && typeof data.objects === 'object' && !Array.isArray(data.objects);
      
      if (!isNewFormat) {
        // Old format: ensure spaces and objects arrays exist
        if (!data.spaces) data.spaces = [{ name: "default", objects: [] }];
        if (!Array.isArray(data.spaces[0].objects)) data.spaces[0].objects = [];
      } else {
        // New format: ensure objects exists
        if (!data.objects) data.objects = {};
        if (!data.spaces) data.spaces = {};
        if (!data.entrySpaceId) {
          // Find or create default space
          const spaceId = Object.keys(data.spaces)[0] || "88453035-dc0f-486d-868a-8ff7c2fda864";
          data.entrySpaceId = spaceId;
          if (!data.spaces[spaceId]) {
            data.spaces[spaceId] = {
              id: spaceId,
              name: "Default",
              activeCamera: null,
              reflections: {
                type: "url",
                url: "https://cdn.8thwall.com/web/assets/envmap/basic_env_map-m9hqpneh.jpg"
              }
            };
          }
        }
      }
      
      // Create geometry based on type
      const geometry: any = { type: args.geometryType };
      
      // Set geometry properties with proper defaults
      switch (args.geometryType) {
        case "box":
          geometry.width = ensureNumber(args.width, 1);
          geometry.height = ensureNumber(args.height, 1);
          geometry.depth = ensureNumber(args.depth, 1);
          break;
        case "sphere":
          geometry.radius = ensureNumber(args.radius, 0.5);
          geometry.widthSegments = ensureNumber(args.radialSegments, 32);
          geometry.heightSegments = ensureNumber(args.radialSegments, 16);
          break;
        case "cylinder":
          geometry.radiusTop = ensureNumber(args.radiusTop || args.radius, 0.5);
          geometry.radiusBottom = ensureNumber(args.radiusBottom || args.radius, 0.5);
          geometry.height = ensureNumber(args.height, 1);
          geometry.radialSegments = ensureNumber(args.radialSegments, 32);
          geometry.heightSegments = 1;
          geometry.openEnded = false;
          break;
        case "plane":
          geometry.width = ensureNumber(args.width, 1);
          geometry.height = ensureNumber(args.height, 1);
          break;
        case "circle":
          geometry.radius = ensureNumber(args.radius, 0.5);
          geometry.segments = ensureNumber(args.radialSegments, 8);
          break;
        case "cone":
          geometry.radius = ensureNumber(args.radius, 0.5);
          geometry.height = ensureNumber(args.height, 1);
          geometry.radialSegments = ensureNumber(args.radialSegments, 32);
          geometry.heightSegments = 1;
          geometry.openEnded = false;
          break;
        case "torus":
          geometry.radius = ensureNumber(args.radius, 0.5);
          geometry.tubeRadius = ensureNumber(args.tube, 0.2);
          geometry.radialSegments = ensureNumber(args.radialSegments, 16);
          geometry.tubularSegments = ensureNumber(args.tubularSegments, 100);
          break;
        case "ring":
          geometry.innerRadius = ensureNumber(args.innerRadius, 0.5);
          geometry.outerRadius = ensureNumber(args.outerRadius, 1);
          geometry.thetaSegments = ensureNumber(args.radialSegments, 32);
          break;
      }
      
      // Create material with proper validation
      // IMPORTANT: Always use "basic" material type for colors to render correctly in 8th Wall Desktop
      // Standard/phong materials with roughness/metalness often fail to display colors properly
      const materialTypeInput = args.materialType || "basic";
      const materialType = materialTypeInput.toLowerCase();
      
      // Force "basic" type for reliable color rendering
      const material: any = {
        type: "basic",
        color: ensureColor(args.color, "#ffffff")
      };
      
      // NOTE: Roughness and metalness are NOT supported with basic materials
      // and cause color rendering issues in 8th Wall Desktop, so we skip them
      
      material.opacity = ensureNumber(args.opacity, 1);
      
      // Support hider/occluder materials (colorWrite: false for AR portals)
      if (args.colorWrite !== undefined) {
        material.colorWrite = args.colorWrite;
      }
      if (args.depthWrite !== undefined) {
        material.depthWrite = args.depthWrite;
      }
      if (args.depthTest !== undefined) {
        material.depthTest = args.depthTest;
      }
      
      if (args.emissive) {
        material.emissive = ensureColor(args.emissive, "#000000");
        material.emissiveIntensity = ensureNumber(args.emissiveIntensity, 1);
      }
      
      // Create the object with all required properties
      const newObject: any = {
        name: args.name,
        position: ensureVec(args.position, [0, 0, 0]),
        rotation: ensureVec(args.rotation, [0, 0, 0, 1]),
        scale: ensureVec(args.scale, [1, 1, 1]),
        geometry,
        material,
        components: {} // CRITICAL: Always initialize components
      };
      
      // Add format-specific properties
      if (isNewFormat) {
        // Generate a unique ID for the new object
        const id = `${args.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
        newObject.id = id;
        newObject.parentId = data.entrySpaceId;
        newObject.order = Date.now() / 1000000;
        
        // Add side and opacity for materials in new format
        if (newObject.material && newObject.material.type) {
          if (!newObject.material.side) newObject.material.side = "Front";
          if (!newObject.material.opacity) newObject.material.opacity = 1;
        }
        
        // Add to objects dictionary
        data.objects[id] = repairObject(newObject);
      } else {
        // Old format: add to array
        const repairedObject = repairObject(newObject);
        data.spaces[0].objects.push(repairedObject);
      }
      
      await writeExpanseJson(data);
      
      return { content: [{ type: "text", text: `Added ${args.geometryType} "${args.name}" to .expanse.json` }] };
    }
  );

  // desktop_add_model
  server.tool(
    "desktop_add_model",
    "Add a 3D model (GLB/GLTF) from assets to the scene",
    {
      name: z.string(),
      assetPath: z.string(),
      position: z.array(z.number()).length(3).optional(),
      rotation: z.array(z.number()).length(4).optional(),
      scale: z.array(z.number()).length(3).optional(),
      animationClip: z.string().optional(),
      loop: z.boolean().optional(),
      addPhysics: z.boolean().optional(),
      physicsMass: z.number().optional(),
      physicsType: z.enum(["static", "dynamic", "kinematic"]).optional()
    },
    async (args: any) => {
      const data = await readExpanseJson();
      
      // Detect structure
      const isNewFormat = data.objects && typeof data.objects === 'object' && !Array.isArray(data.objects);
      
      if (!isNewFormat) {
        throw new Error("Model loading only supported in new format projects");
      }
      
      // Ensure objects and spaces exist
      if (!data.objects) data.objects = {};
      if (!data.spaces) data.spaces = {};
      if (!data.entrySpaceId) {
        const spaceId = Object.keys(data.spaces)[0] || "88453035-dc0f-486d-868a-8ff7c2fda864";
        data.entrySpaceId = spaceId;
        if (!data.spaces[spaceId]) {
          data.spaces[spaceId] = {
            id: spaceId,
            name: "Default",
            activeCamera: null,
            reflections: {
              type: "url",
              url: "https://cdn.8thwall.com/web/assets/envmap/basic_env_map-m9hqpneh.jpg"
            }
          };
        }
      }
      
      // Create the model object (matching working 8th Wall Desktop structure)
      const modelId = `${args.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
      const newModel: any = {
        id: modelId,
        name: args.name,
        position: ensureVec(args.position, [0, 0, 0]),
        rotation: ensureVec(args.rotation, [0, 0, 0, 1]),
        scale: ensureVec(args.scale, [1, 1, 1]),
        geometry: null,
        material: null,
        components: {},
        gltfModel: {
          src: {
            type: "asset",
            asset: args.assetPath
          },
          animationClip: args.animationClip || "",
          loop: args.loop !== false
        },
        order: Date.now() / 1000000,
        prefab: true
      };
      
      // Add physics if requested
      if (args.addPhysics) {
        const physicsType = args.physicsType || "dynamic";
        const mass = args.physicsMass !== undefined ? args.physicsMass : (physicsType === "static" ? 0 : 1);
        
        newModel.collider = {
          geometry: {
            type: "box",
            width: 1,
            height: 1,
            depth: 1
          },
          mass: mass,
          type: physicsType,
          offsetX: 0,
          offsetY: 0,
          offsetZ: 0,
          restitution: 0.5
        };
      }
      
      data.objects[modelId] = newModel;
      
      // Create an INSTANCE of the model (what actually appears in the scene)
      const instanceId = `${modelId}-inst`;
      const instance: any = {
        id: instanceId,
        position: newModel.position,
        rotation: newModel.rotation,
        scale: newModel.scale,
        name: args.name,
        instanceData: {
          instanceOf: modelId,
          deletions: {},
          children: {}
        },
        parentId: data.entrySpaceId,
        components: {}
      };
      
      // Copy physics to instance if requested
      if (args.addPhysics && newModel.collider) {
        instance.collider = newModel.collider;
        delete newModel.collider; // Remove from prefab, keep on instance
      }
      
      data.objects[instanceId] = instance;
      
      await writeExpanseJson(data);
      
      return { content: [{ type: "text", text: `Added 3D model "${args.name}" (${args.assetPath}) with instance to .expanse.json` }] };
    }
  );

  // desktop_enable_face_tracking
  server.tool(
    "desktop_enable_face_tracking",
    "Enable face tracking in .expanse.json with optional debug mesh",
    { addDebugMesh: z.boolean().optional() },
    async (args: any) => {
      const data = await readExpanseJson();
      
      if (!data.scene) data.scene = {};
      if (!data.scene.faceTracking) data.scene.faceTracking = {};
      data.scene.faceTracking.enabled = true;
      
      if (args.addDebugMesh) {
        if (!data.spaces) data.spaces = [{ name: "default", objects: [] }];
        if (!Array.isArray(data.spaces[0].objects)) data.spaces[0].objects = [];
        
        const debugMesh = {
          name: "face-mesh-debug",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          geometry: { type: "face-mesh" },
          material: { type: "basic", color: "#00ff00" },
          components: {} // CRITICAL
        };
        
        data.spaces[0].objects.push(repairObject(debugMesh));
      }
      
      await writeExpanseJson(data);
      return { content: [{ type: "text", text: "Face tracking enabled" }] };
    }
  );

  // desktop_add_rotation_animation
  server.tool(
    "desktop_add_rotation_animation",
    "Add rotation animation to an object by name",
    {
      objectName: z.string().describe("Name of the object to animate"),
      axis: z.enum(["x", "y", "z"]).describe("Axis to rotate around"),
      degreesPerSecond: z.number().optional().default(60).describe("Rotation speed in degrees per second"),
      loop: z.boolean().optional().default(true).describe("Whether to loop the animation"),
      reverse: z.boolean().optional().default(false).describe("Whether to reverse direction after each loop"),
      easeIn: z.boolean().optional().default(false).describe("Ease in at start"),
      easeOut: z.boolean().optional().default(false).describe("Ease out at end"),
    },
    async (args: any) => {
      const data = await readExpanseJson();
      
      // Find object by name
      const objectId = Object.keys(data.objects).find(id => 
        data.objects[id].name === args.objectName
      );
      
      if (!objectId) {
        return { 
          content: [{ type: "text", text: `Error: Object "${args.objectName}" not found` }],
          isError: true 
        };
      }
      
      const obj = data.objects[objectId];
      
      // Calculate duration from speed
      const duration = 360 / args.degreesPerSecond;
      
      // Create rotation animation attribute
      const rotateAnimation = {
        autoFrom: true,
        toX: args.axis === 'x' ? 360 : 0,
        toY: args.axis === 'y' ? 360 : 0,
        toZ: args.axis === 'z' ? 360 : 0,
        shortestPath: false,
        duration: duration,
        loop: args.loop,
        reverse: args.reverse,
        easeIn: args.easeIn,
        easeOut: args.easeOut,
        easingFunction: 'linear'
      };
      
      // Add or update attributes
      if (!obj.attributes) {
        obj.attributes = {};
      }
      
      obj.attributes.RotateAnimation = rotateAnimation;
      
      await writeExpanseJson(data);
      
      return { 
        content: [{ 
          type: "text", 
          text: `✅ Added rotation animation to "${args.objectName}" (${args.degreesPerSecond}°/sec around ${args.axis}-axis, duration: ${duration.toFixed(2)}s)` 
        }] 
      };
    }
  );

  // desktop_add_scale_animation
  server.tool(
    "desktop_add_scale_animation",
    "Add scale (pulse/breathe) animation to an object by name",
    {
      objectName: z.string().describe("Name of the object to animate"),
      minScale: z.number().optional().default(0.8).describe("Minimum scale multiplier (e.g., 0.8 = 80% of original size)"),
      maxScale: z.number().optional().default(1.2).describe("Maximum scale multiplier (e.g., 1.2 = 120% of original size)"),
      duration: z.number().optional().default(1).describe("Duration in seconds for one cycle"),
      loop: z.boolean().optional().default(true).describe("Whether to loop the animation"),
      reverse: z.boolean().optional().default(true).describe("Whether to reverse (breathe back down)"),
      easeIn: z.boolean().optional().default(true).describe("Ease in at start"),
      easeOut: z.boolean().optional().default(true).describe("Ease out at end"),
    },
    async (args: any) => {
      const data = await readExpanseJson();
      
      // Find object by name
      const objectId = Object.keys(data.objects).find(id => 
        data.objects[id].name === args.objectName
      );
      
      if (!objectId) {
        return { 
          content: [{ type: "text", text: `Error: Object "${args.objectName}" not found` }],
          isError: true 
        };
      }
      
      const obj = data.objects[objectId];
      
      // Create scale animation attribute
      const scaleAnimation = {
        autoFrom: true,
        toX: args.maxScale,
        toY: args.maxScale,
        toZ: args.maxScale,
        duration: args.duration,
        loop: args.loop,
        reverse: args.reverse,
        easeIn: args.easeIn,
        easeOut: args.easeOut,
        easingFunction: 'linear'
      };
      
      // Add or update attributes
      if (!obj.attributes) {
        obj.attributes = {};
      }
      
      obj.attributes.ScaleAnimation = scaleAnimation;
      
      await writeExpanseJson(data);
      
      return { 
        content: [{ 
          type: "text", 
          text: `✅ Added scale animation to "${args.objectName}" (${args.minScale}x to ${args.maxScale}x over ${args.duration}s)` 
        }] 
      };
    }
  );

  // desktop_add_image_target
  server.tool(
    "desktop_add_image_target",
    "Add an image target container for AR image tracking",
    {
      targetName: z.string().describe("Name of the image target (e.g., 'my-poster')"),
      imageUrl: z.string().describe("Path to target image in assets (e.g., 'assets/poster.jpg')"),
      position: z.array(z.number()).length(3).optional(),
      rotation: z.array(z.number()).length(4).optional(),
      scale: z.array(z.number()).length(3).optional()
    },
    async (args: any) => {
      const data = await readExpanseJson();
      
      // Ensure camera is configured for image targets
      const cameraId = Object.keys(data.objects).find(id => 
        data.objects[id].camera
      );
      
      if (cameraId) {
        const camera = data.objects[cameraId];
        if (!camera.camera.xr) camera.camera.xr = {};
        camera.camera.xr.xrCameraType = "imageTargets";
        camera.camera.xr.phone = "AR";
        
        if (!camera.camera.xr.imageTargets) {
          camera.camera.xr.imageTargets = { targets: [] };
        }
        
        // Add target to camera's target list if not already there
        const targetExists = camera.camera.xr.imageTargets.targets.some(
          (t: any) => t.name === args.targetName
        );
        
        if (!targetExists) {
          camera.camera.xr.imageTargets.targets.push({
            name: args.targetName,
            url: args.imageUrl
          });
        }
      }
      
      // Create image target container
      const id = `image-target-${args.targetName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
      const newObject: any = {
        id,
        name: `Image Target - ${args.targetName}`,
        position: ensureVec(args.position, [0, 0, 0]),
        rotation: ensureVec(args.rotation, [0, 0, 0, 1]),
        scale: ensureVec(args.scale, [1, 1, 1]),
        geometry: null,
        material: null,
        components: {},
        imageTarget: {
          name: args.targetName
        },
        parentId: data.entrySpaceId,
        order: Date.now() / 1000000
      };
      
      data.objects[id] = newObject;
      await writeExpanseJson(data);
      
      return { 
        content: [{ 
          type: "text", 
          text: `✅ Created image target container "${args.targetName}". Add content as children of this object to appear when the image is detected.` 
        }] 
      };
    }
  );

  // desktop_add_video
  server.tool(
    "desktop_add_video",
    "Add a video plane with custom JavaScript for video texture",
    {
      videoFile: z.string().describe("Path to video file in assets (e.g., 'assets/video.mp4')"),
      planeName: z.string().optional().describe("Name for the video plane (default: 'Video Plane')"),
      position: z.array(z.number()).length(3).optional(),
      rotation: z.array(z.number()).length(4).optional(),
      scale: z.array(z.number()).length(3).optional(),
      parentId: z.string().optional().describe("Parent object ID (e.g., image target container)"),
      autoplay: z.boolean().optional().default(true),
      loop: z.boolean().optional().default(true),
      muted: z.boolean().optional().default(false)
    },
    async (args: any) => {
      const data = await readExpanseJson();
      const root = projectRoot();
      
      const planeName = args.planeName || "Video Plane";
      const videoFileName = path.basename(args.videoFile);
      
      // Create video plane
      const planeId = `video-plane-${Date.now().toString(36)}`;
      const newPlane: any = {
        id: planeId,
        name: planeName,
        position: ensureVec(args.position, [0, 0.6, 0]),
        rotation: ensureVec(args.rotation, [-0.7071068, 0, 0, 0.7071068]), // Face up by default
        scale: ensureVec(args.scale, [1.6, 0.9, 1]), // 16:9 aspect ratio
        geometry: {
          type: "plane",
          width: 1,
          height: 1
        },
        material: {
          type: "basic",
          color: "#ffffff",
          opacity: 1
        },
        components: {},
        parentId: args.parentId || data.entrySpaceId,
        order: Date.now() / 1000000
      };
      
      data.objects[planeId] = newPlane;
      
      // Create video texture JavaScript file
      const videoScript = `// Video texture script for ${planeName}
// Applies video from ${args.videoFile} to plane

window.addEventListener('load', () => {
  console.log('Video texture script loaded for ${planeName}');
  
  const checkScene = setInterval(() => {
    const scene = window.XR8?.Threejs?.xrScene?.();
    if (!scene) return;
    
    clearInterval(checkScene);
    console.log('Scene found, setting up video...');
    
    // Create video element
    const video = document.createElement('video');
    video.src = '${args.videoFile}';
    video.crossOrigin = 'anonymous';
    video.loop = ${args.loop};
    video.muted = ${args.muted};
    video.playsInline = true;
    
    // Create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    // Find the video plane
    const findPlane = (obj) => {
      if (obj.name === '${planeName}') {
        console.log('Found ${planeName}!');
        
        // Replace material with video texture
        obj.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
          side: THREE.DoubleSide
        });
        
        // Play video
        ${args.autoplay ? `
        const playVideo = () => {
          video.play().catch(err => {
            console.log('Video autoplay blocked, adding tap-to-play:', err);
            document.addEventListener('touchstart', () => {
              video.play();
            }, { once: true });
          });
        };
        
        playVideo();
        
        // Also play when parent becomes visible
        if (obj.parent) {
          const checkVisible = () => {
            if (obj.parent.visible) {
              playVideo();
            }
          };
          setInterval(checkVisible, 500);
        }
        ` : ''}
      }
      
      obj.children.forEach(findPlane);
    };
    
    scene.children.forEach(findPlane);
  }, 100);
});
`;
      
      // Write video script file
      const scriptPath = path.join(root, 'src', 'video-texture.js');
      await fs.writeFile(scriptPath, videoScript, 'utf-8');
      
      // Add script to .expanse.json if not already there
      if (!data.scripts) {
        data.scripts = [];
      }
      if (!data.scripts.includes('src/video-texture.js')) {
        data.scripts.push('src/video-texture.js');
      }
      
      await writeExpanseJson(data);
      
      return { 
        content: [{ 
          type: "text", 
          text: `✅ Added video plane "${planeName}" with texture from ${args.videoFile}\n✅ Created src/video-texture.js\n✅ Added script to .expanse.json\n\nMake sure ${args.videoFile} exists in your project!` 
        }] 
      };
    }
  );

  // desktop_set_model_animation
  server.tool(
    "desktop_set_model_animation",
    "Set animation clip playback for a GLB/GLTF model",
    {
      modelName: z.string().describe("Name of the model object"),
      animationClip: z.string().describe("Name of the animation clip to play (e.g., 'idle', 'walk', 'run')"),
      loop: z.boolean().optional().default(true).describe("Whether to loop the animation"),
      speed: z.number().optional().default(1).describe("Playback speed multiplier"),
    },
    async (args: any) => {
      const data = await readExpanseJson();
      
      // Find model by name (check both prefab and instance)
      const objectId = Object.keys(data.objects).find(id => 
        data.objects[id].name === args.modelName
      );
      
      if (!objectId) {
        return { 
          content: [{ type: "text", text: `Error: Model "${args.modelName}" not found` }],
          isError: true 
        };
      }
      
      const obj = data.objects[objectId];
      
      // Check if this is a model object
      if (!obj.gltfModel && !obj.instanceData) {
        return { 
          content: [{ type: "text", text: `Error: "${args.modelName}" is not a GLB/GLTF model` }],
          isError: true 
        };
      }
      
      // Find the prefab if this is an instance
      let targetObj = obj;
      if (obj.instanceData && obj.instanceData.prefab) {
        const prefabId = obj.instanceData.prefab;
        if (data.objects[prefabId]) {
          targetObj = data.objects[prefabId];
        }
      }
      
      // Set animation properties on the gltfModel
      if (!targetObj.gltfModel) {
        return { 
          content: [{ type: "text", text: `Error: Could not find gltfModel on "${args.modelName}"` }],
          isError: true 
        };
      }
      
      targetObj.gltfModel.animationClip = args.animationClip;
      targetObj.gltfModel.loop = args.loop;
      targetObj.gltfModel.speed = args.speed;
      
      await writeExpanseJson(data);
      
      return { 
        content: [{ 
          type: "text", 
          text: `✅ Set animation "${args.animationClip}" on model "${args.modelName}" (loop: ${args.loop}, speed: ${args.speed}x)` 
        }] 
      };
    }
  );
}
