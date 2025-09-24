import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

type Server = any;

function projectRoot(): string {
  return process.env.PROJECT_ROOT || path.resolve(process.cwd(), "project");
}

async function readFileText(rel: string): Promise<string> {
  const full = path.resolve(projectRoot(), rel);
  return await fs.readFile(full, "utf-8");
}

async function writeFileText(rel: string, content: string): Promise<void> {
  const full = path.resolve(projectRoot(), rel);
  await fs.writeFile(full, content, "utf-8");
}

function detectEngineFromIndexHtml(html: string): "aframe" | "three" | "unknown" {
  const l = html.toLowerCase();
  if (l.includes("aframe.min.js") || l.includes("<a-scene")) return "aframe";
  if (l.includes("three.module.js") || l.includes("vrbutton.js")) return "three";
  return "unknown";
}

function injectAframeEntity(html: string, entityMarkup: string): string {
  const closeTag = /<\/a-scene\s*>/i;
  if (closeTag.test(html)) {
    return html.replace(closeTag, `  ${entityMarkup}\n</a-scene>`);
  }
  // Fallback: append before </body>
  return html.replace(/<\/body>/i, `${entityMarkup}\n</body>`);
}

function setAframeBackground(html: string, color: string): string {
  const sceneOpen = /<a-scene([^>]*)>/i;
  return html.replace(sceneOpen, (m, attrs) => {
    const hasBg = /background=\"[^\"]*\"/i.test(m);
    if (hasBg) {
      return m.replace(/background=\"[^\"]*\"/i, `background=\"color: ${color}\"`);
    }
    const newAttrs = `${attrs} background=\"color: ${color}\"`;
    return `<a-scene${newAttrs}>`;
  });
}

function addThreeImport(mainJs: string, importLine: string): { code: string; added: boolean } {
  if (mainJs.includes(importLine)) return { code: mainJs, added: false };
  return { code: `${importLine}\n${mainJs}`, added: true };
}

function insertAfterFirst(sceneText: string, markerRegex: RegExp, insert: string): { code: string; inserted: boolean } {
  const m = markerRegex.exec(sceneText);
  if (!m) return { code: `${sceneText}\n${insert}\n`, inserted: false };
  const idx = m.index + m[0].length;
  return { code: sceneText.slice(0, idx) + "\n" + insert + "\n" + sceneText.slice(idx), inserted: true };
}

export function registerSceneTools(server: Server) {
  // scene.detect_engine
  server.tool(
    "scene_detect_engine",
    "Detect whether the project uses A-Frame or Three.js",
    async () => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      return { content: [{ type: "json", json: { engine } }] };
    }
  );

  // scene.add_gltf_model
  server.tool(
    "scene_add_gltf_model",
    "Add a GLTF/GLB model to the scene (A-Frame or Three.js)",
    {
      src: z.string(),
      position: z.array(z.number()).length(3).optional(),
      rotation: z.array(z.number()).length(3).optional(),
      scale: z.array(z.number()).length(3).optional()
    },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      const src = String(args.src);
      const pos = (args.position as number[] | undefined) || [0, 1, -2];
      const rot = (args.rotation as number[] | undefined) || [0, 0, 0];
      const scl = (args.scale as number[] | undefined) || [1, 1, 1];

      if (engine === "aframe") {
        const entity = `<a-entity gltf-model=\"url(${src})\" position=\"${pos.join(" ")}\" rotation=\"${rot.join(" ")}\" scale=\"${scl.join(" ")}\"></a-entity>`;
        const updated = injectAframeEntity(html, entity);
        await writeFileText("index.html", updated);
        return { content: [{ type: "text", text: `Added A-Frame model entity: ${src}` }] };
      }

      if (engine === "three") {
        let main = await readFileText("main.js");
        const importLine = `import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';`;
        main = addThreeImport(main, importLine).code;
        const loaderSnippet = `const _loader = new GLTFLoader();\n_loader.load('${src}', (gltf)=>{\n  const _model = gltf.scene;\n  _model.position.set(${pos[0]}, ${pos[1]}, ${pos[2]});\n  _model.rotation.set(${rot[0]}, ${rot[1]}, ${rot[2]});\n  _model.scale.set(${scl[0]}, ${scl[1]}, ${scl[2]});\n  scene.add(_model);\n}, undefined, (e)=>{ console.error('GLTF load error', e); });`;
        // Insert after scene creation if found, else append
        const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
        const res = insertAfterFirst(main, marker, loaderSnippet);
        await writeFileText("main.js", res.code);
        return { content: [{ type: "text", text: `Added Three.js model loader: ${src}` }] };
      }

      return { content: [{ type: "text", text: "Unknown engine; ensure index.html uses A-Frame or Three.js template." }] };
    }
  );

  // scene.set_background_color
  server.tool(
    "scene_set_background_color",
    "Set scene background color",
    { color: z.string() },
    async (args: any) => {
      const color = String(args.color);
      let html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      if (engine === "aframe") {
        html = setAframeBackground(html, color);
        await writeFileText("index.html", html);
        return { content: [{ type: "text", text: `A-Frame background set to ${color}` }] };
      }
      if (engine === "three") {
        let js = await readFileText("main.js");
        // Replace scene.background or set it after scene creation
        if (/scene\.background\s*=/.test(js)) {
          js = js.replace(/scene\.background\s*=\s*new\s+THREE\.Color\([^)]*\)\s*;?/g, `scene.background = new THREE.Color('${color}');`);
        } else {
          const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
          const ins = insertAfterFirst(js, marker, `scene.background = new THREE.Color('${color}');`);
          js = ins.code;
        }
        await writeFileText("main.js", js);
        return { content: [{ type: "text", text: `Three.js background set to ${color}` }] };
      }
      return { content: [{ type: "text", text: "Unknown engine; cannot set background." }] };
    }
  );

  // scene.add_primitive
  server.tool(
    "scene_add_primitive",
    "Add a primitive shape to the scene",
    {
      type: z.enum(["box", "sphere", "cylinder", "plane"]),
      color: z.string().optional(),
      size: z.array(z.number()).optional(),
      position: z.array(z.number()).length(3).optional(),
      rotation: z.array(z.number()).length(3).optional(),
      scale: z.array(z.number()).length(3).optional()
    },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      const type = args.type as "box" | "sphere" | "cylinder" | "plane";
      const color = String(args.color || "#FFD166");
      const pos = (args.position as number[] | undefined) || [0, 1, -2];
      const rot = (args.rotation as number[] | undefined) || [0, 0, 0];
      const scl = (args.scale as number[] | undefined) || [1, 1, 1];
      const size = (args.size as number[] | undefined) || [1, 1, 1];

      if (engine === "aframe") {
        let entity = "";
        if (type === "box") entity = `<a-box color=\"${color}\" position=\"${pos.join(" ")}\" rotation=\"${rot.join(" ")}\" depth=\"${size[2]}\" height=\"${size[1]}\" width=\"${size[0]}\" scale=\"${scl.join(" ")}\"></a-box>`;
        else if (type === "sphere") entity = `<a-sphere color=\"${color}\" position=\"${pos.join(" ")}\" radius=\"${size[0]/2}\" scale=\"${scl.join(" ")}\"></a-sphere>`;
        else if (type === "cylinder") entity = `<a-cylinder color=\"${color}\" position=\"${pos.join(" ")}\" radius=\"${size[0]/2}\" height=\"${size[1]}\" rotation=\"${rot.join(" ")}\" scale=\"${scl.join(" ")}\"></a-cylinder>`;
        else if (type === "plane") entity = `<a-plane color=\"${color}\" position=\"${pos.join(" ")}\" rotation=\"${rot.join(" ")}\" width=\"${size[0]}\" height=\"${size[1]}\" scale=\"${scl.join(" ")}\"></a-plane>`;
        const updated = injectAframeEntity(html, entity);
        await writeFileText("index.html", updated);
        return { content: [{ type: "text", text: `Added A-Frame ${type}` }] };
      }

      if (engine === "three") {
        let main = await readFileText("main.js");
        let geoExpr = "";
        if (type === "box") geoExpr = `new THREE.BoxGeometry(${size[0]}, ${size[1]}, ${size[2]})`;
        if (type === "sphere") geoExpr = `new THREE.SphereGeometry(${Math.max(size[0], size[1], size[2]) / 2}, 32, 16)`;
        if (type === "cylinder") geoExpr = `new THREE.CylinderGeometry(${size[0]/2}, ${size[0]/2}, ${size[1]}, 32)`;
        if (type === "plane") geoExpr = `new THREE.PlaneGeometry(${size[0]}, ${size[1]})`;
        const snippet = `{
  const _geo = ${geoExpr};
  const _mat = new THREE.MeshStandardMaterial({ color: '${color}' });
  const _mesh = new THREE.Mesh(_geo, _mat);
  _mesh.position.set(${pos[0]}, ${pos[1]}, ${pos[2]});
  _mesh.rotation.set(${rot[0]}, ${rot[1]}, ${rot[2]});
  _mesh.scale.set(${scl[0]}, ${scl[1]}, ${scl[2]});
  if ('${type}' === 'plane') _mesh.rotateX(-Math.PI/2);
  scene.add(_mesh);
}`;
        const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
        const res = insertAfterFirst(main, marker, snippet);
        await writeFileText("main.js", res.code);
        return { content: [{ type: "text", text: `Added Three.js ${type}` }] };
      }
      return { content: [{ type: "text", text: "Unknown engine; cannot add primitive." }] };
    }
  );

  // scene.add_light
  server.tool(
    "scene_add_light",
    "Add a light to the scene",
    {
      kind: z.enum(["ambient", "hemisphere", "directional", "point"]),
      color: z.string().optional(),
      intensity: z.number().optional(),
      position: z.array(z.number()).length(3).optional()
    },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      const kind = args.kind as "ambient" | "hemisphere" | "directional" | "point";
      const color = String(args.color || "#ffffff");
      const intensity = Number(args.intensity ?? 1.0);
      const pos = (args.position as number[] | undefined) || [2, 3, 2];

      if (engine === "aframe") {
        const typeMap: Record<string, string> = { ambient: "ambient", hemisphere: "hemisphere", directional: "directional", point: "point" };
        const entity = `<a-entity light=\"type: ${typeMap[kind]}; color: ${color}; intensity: ${intensity}\" position=\"${pos.join(" ")}\"></a-entity>`;
        const updated = injectAframeEntity(html, entity);
        await writeFileText("index.html", updated);
        return { content: [{ type: "text", text: `Added A-Frame ${kind} light` }] };
      }

      if (engine === "three") {
        let main = await readFileText("main.js");
        let expr = "";
        if (kind === "ambient") expr = `new THREE.AmbientLight('${color}', ${intensity})`;
        if (kind === "hemisphere") expr = `new THREE.HemisphereLight('${color}', '#444444', ${intensity})`;
        if (kind === "directional") expr = `new THREE.DirectionalLight('${color}', ${intensity})`;
        if (kind === "point") expr = `new THREE.PointLight('${color}', ${intensity})`;
        const snippet = `{
  const _light = ${expr};
  _light.position.set(${pos[0]}, ${pos[1]}, ${pos[2]});
  scene.add(_light);
}`;
        const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
        const res = insertAfterFirst(main, marker, snippet);
        await writeFileText("main.js", res.code);
        return { content: [{ type: "text", text: `Added Three.js ${kind} light` }] };
      }
      return { content: [{ type: "text", text: "Unknown engine; cannot add light." }] };
    }
  );

  // scene.set_environment_hdr
  server.tool(
    "scene_set_environment_hdr",
    "Set environment using an HDR/EXR URL",
    { url: z.string(), applyBackground: z.boolean().optional() },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      const url = String(args.url);
      const applyBg = args.applyBackground !== false;

      if (engine === "aframe") {
        // Use a-sky with src
        const sky = `<a-sky src=\"${url}\"></a-sky>`;
        const updated = injectAframeEntity(html, sky);
        await writeFileText("index.html", updated);
        return { content: [{ type: "text", text: `A-Frame sky set to ${url}` }] };
      }

      if (engine === "three") {
        let main = await readFileText("main.js");
        const importLine = `import { RGBELoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/RGBELoader.js';`;
        main = addThreeImport(main, importLine).code;
        const snippet = `{
  const _hdrLoader = new RGBELoader();
  _hdrLoader.load('${url}', (tex)=>{
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = tex;
    ${applyBg ? "scene.background = tex;" : ""}
  }, undefined, (e)=>console.error('HDR load error', e));
}`;
        const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
        const res = insertAfterFirst(main, marker, snippet);
        await writeFileText("main.js", res.code);
        return { content: [{ type: "text", text: `Three.js environment set from ${url}` }] };
      }
      return { content: [{ type: "text", text: "Unknown engine; cannot set environment." }] };
    }
  );

  // scene.add_animation (simple spin)
  server.tool(
    "scene_add_animation",
    "Add a simple spin animation to meshes (Three) or an A-Frame animation entity",
    { type: z.enum(["spin"]).optional(), speed: z.number().optional() },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      const speed = Number(args.speed ?? 0.01);

      if (engine === "aframe") {
        const animEnt = `<a-entity animation=\"property: rotation; to: 0 360 0; loop: true; dur: ${Math.max(100, Math.floor(628/speed))}\"></a-entity>`;
        const updated = injectAframeEntity(html, animEnt);
        await writeFileText("index.html", updated);
        return { content: [{ type: "text", text: `A-Frame spin animation added` }] };
      }

      if (engine === "three") {
        let main = await readFileText("main.js");
        // Insert traversal spin inside setAnimationLoop
        const loopRegex = /renderer\.setAnimationLoop\s*\(\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\)\s*;?/m;
        if (loopRegex.test(main)) {
          main = main.replace(loopRegex, (m, body) => {
            const injected = `scene.traverse(o=>{ if(o.isMesh) o.rotation.y += ${speed}; });\n` + body;
            return m.replace(body, injected);
          });
        } else {
          // Fallback: append a new animation loop
          main += `\n// MCP animation\nconst __mcpAnim = ()=>{ scene.traverse(o=>{ if(o.isMesh) o.rotation.y += ${speed}; }); };\nconst __oldLoop = (renderer.setAnimationLoop||(()=>{}));\nrenderer.setAnimationLoop(()=>{ __mcpAnim(); renderer.render(scene, camera); });\n`;
        }
        await writeFileText("main.js", main);
        return { content: [{ type: "text", text: `Three.js spin animation added` }] };
      }
      return { content: [{ type: "text", text: "Unknown engine; cannot add animation." }] };
    }
  );

  // scene.add_textured_plane
  server.tool(
    "scene_add_textured_plane",
    "Add a textured plane (e.g., for backgrounds/posters)",
    { url: z.string(), width: z.number().optional(), height: z.number().optional(), position: z.array(z.number()).length(3).optional(), rotation: z.array(z.number()).length(3).optional() },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      const url = String(args.url);
      const w = Number(args.width ?? 2);
      const h = Number(args.height ?? 2);
      const pos = (args.position as number[] | undefined) || [0, 1, -2];
      const rot = (args.rotation as number[] | undefined) || [0, 0, 0];

      if (engine === "aframe") {
        const entity = `<a-plane width=\"${w}\" height=\"${h}\" position=\"${pos.join(" ")}\" rotation=\"${rot.join(" ")}\" material=\"src: url(${url}); side: double\"></a-plane>`;
        const updated = injectAframeEntity(html, entity);
        await writeFileText("index.html", updated);
        return { content: [{ type: "text", text: `A-Frame textured plane added (${url})` }] };
      }

      if (engine === "three") {
        let main = await readFileText("main.js");
        const importLine = `import { TextureLoader } from 'https://unpkg.com/three@0.160.0/build/three.module.js';`;
        main = addThreeImport(main, importLine).code;
        const snippet = `{
  const _tex = new THREE.TextureLoader().load('${url}');
  const _mat = new THREE.MeshBasicMaterial({ map: _tex, side: THREE.DoubleSide });
  const _geo = new THREE.PlaneGeometry(${w}, ${h});
  const _mesh = new THREE.Mesh(_geo, _mat);
  _mesh.position.set(${pos[0]}, ${pos[1]}, ${pos[2]});
  _mesh.rotation.set(${rot[0]}, ${rot[1]}, ${rot[2]});
  scene.add(_mesh);
}`;
        const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
        const res = insertAfterFirst(main, marker, snippet);
        await writeFileText("main.js", res.code);
        return { content: [{ type: "text", text: `Three.js textured plane added (${url})` }] };
      }
      return { content: [{ type: "text", text: "Unknown engine; cannot add textured plane." }] };
    }
  );

  // scene.add_orbit_controls (Three.js only)
  server.tool(
    "scene_add_orbit_controls",
    "Add OrbitControls to Three.js scene",
    async () => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      if (engine !== "three") return { content: [{ type: "text", text: "OrbitControls only available for Three.js template." }] };
      let main = await readFileText("main.js");
      const importLine = `import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';`;
      main = addThreeImport(main, importLine).code;
      const snippet = `const _controls = new OrbitControls(camera, renderer.domElement);`;
      const marker = /const\s+camera\s*=\s*new\s+THREE\.PerspectiveCamera[\s\S]*?;\s*/m;
      const res = insertAfterFirst(main, marker, snippet);
      // Also ensure controls.update() gets called in loop
      const loopRegex = /renderer\.setAnimationLoop\s*\(\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\)\s*;?/m;
      if (loopRegex.test(res.code)) {
        const patched = res.code.replace(loopRegex, (m, body) => {
          const injected = `_controls.update();\n` + body;
          return m.replace(body, injected);
        });
        await writeFileText("main.js", patched);
      } else {
        await writeFileText("main.js", res.code);
      }
      return { content: [{ type: "text", text: "OrbitControls added" }] };
    }
  );

  // scene.add_grid_helper (Three.js only)
  server.tool(
    "scene_add_grid_helper",
    "Add a GridHelper to the scene (Three.js)",
    { size: z.number().optional(), divisions: z.number().optional() },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      if (engine !== "three") return { content: [{ type: "text", text: "GridHelper only for Three.js template." }] };
      const size = Number(args.size ?? 10);
      const divisions = Number(args.divisions ?? 10);
      let main = await readFileText("main.js");
      const snippet = `{
  const _grid = new THREE.GridHelper(${size}, ${divisions});
  scene.add(_grid);
}`;
      const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
      const res = insertAfterFirst(main, marker, snippet);
      await writeFileText("main.js", res.code);
      return { content: [{ type: "text", text: "GridHelper added" }] };
    }
  );

  // scene.add_floor (Three.js only)
  server.tool(
    "scene_add_floor",
    "Add a simple floor plane (Three.js)",
    { size: z.number().optional(), color: z.string().optional() },
    async (args: any) => {
      const html = await readFileText("index.html");
      const engine = detectEngineFromIndexHtml(html);
      if (engine !== "three") return { content: [{ type: "text", text: "Floor only for Three.js template." }] };
      const size = Number(args.size ?? 10);
      const color = String(args.color ?? "#888888");
      let main = await readFileText("main.js");
      const snippet = `{
  const _geo = new THREE.PlaneGeometry(${size}, ${size});
  const _mat = new THREE.MeshStandardMaterial({ color: '${color}' });
  const _floor = new THREE.Mesh(_geo, _mat);
  _floor.rotation.x = -Math.PI/2;
  scene.add(_floor);
}`;
      const marker = /const\s+scene\s*=\s*new\s+THREE\.Scene\s*\([^)]*\)\s*;?/;
      const res = insertAfterFirst(main, marker, snippet);
      await writeFileText("main.js", res.code);
      return { content: [{ type: "text", text: "Floor added" }] };
    }
  );
}
