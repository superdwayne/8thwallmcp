export function registerPromptTools(server: any) {
  server.tool(
    "prompts_asset_strategy",
    "Guidance for choosing and importing assets/textures/HDRIs for web XR apps",
    async () => {
      const text = `When building a web-based XR app (8th Wall-style):

1. Inspect project structure via project.get_info and review relevant files.
2. Prefer existing libraries and CDNs over large local bundles when possible.
3. Asset source priority:
   - Generic props/materials/HDRIs: Use PolyHaven. Download into project/assets/ with assets.download_url.
4. Keep models lightweight (optimize meshes and textures), and consider DRACO/meshopt when applicable in runtime.
5. Organize assets under project/assets/{models,textures,hdris} and reference with relative paths.
6. After importing assets, wire them in code (e.g., load GLB via three.js/AFRAME) and validate performance on mobile.
7. Commit small, test iteratively.
`;
      return { content: [{ type: "text", text }] };
    }
  );
}
