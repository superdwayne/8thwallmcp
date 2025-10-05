import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getProjectRoot } from "../utils/projectRoot.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type Server = McpServer;

interface AssetResult {
  name: string;
  source: 'polyhaven' | 'local' | 'sketchfab' | 'poly-pizza';
  type: 'model' | 'texture' | 'hdri' | 'audio' | 'unknown';
  url?: string;
  downloadUrl?: string;
  previewUrl?: string;
  description?: string;
  fileSize?: string;
  formats?: string[];
  score: number;
}

// Rank results by relevance to search query
function rankResults(results: AssetResult[], query: string): AssetResult[] {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/);
  
  return results.map(result => {
    let score = 0;
    const lowerName = result.name.toLowerCase();
    const lowerDesc = (result.description || '').toLowerCase();
    
    // Exact name match
    if (lowerName === lowerQuery) score += 100;
    
    // Name starts with query
    if (lowerName.startsWith(lowerQuery)) score += 50;
    
    // Name contains query
    if (lowerName.includes(lowerQuery)) score += 25;
    
    // Count matching words
    for (const word of queryWords) {
      if (lowerName.includes(word)) score += 10;
      if (lowerDesc.includes(word)) score += 5;
    }
    
    return { ...result, score };
  }).sort((a, b) => b.score - a.score);
}

// Search local assets directory
async function searchLocalAssets(query: string): Promise<AssetResult[]> {
  const root = getProjectRoot();
  const assetsDir = path.join(root, "assets");
  const results: AssetResult[] = [];
  
  try {
    const scanDir = async (dir: string, depth: number = 0): Promise<void> => {
      if (depth > 3) return; // Limit recursion depth
      
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          let type: AssetResult['type'] = 'unknown';
          
          if (['.glb', '.gltf', '.obj', '.fbx'].includes(ext)) type = 'model';
          else if (['.jpg', '.jpeg', '.png', '.webp', '.hdr', '.exr'].includes(ext)) type = 'texture';
          else if (['.mp3', '.wav', '.ogg'].includes(ext)) type = 'audio';
          
          const relativePath = path.relative(root, fullPath);
          results.push({
            name: entry.name,
            source: 'local',
            type,
            url: relativePath,
            downloadUrl: relativePath,
            score: 0
          });
        }
      }
    };
    
    await scanDir(assetsDir);
  } catch (err: any) {
    // Assets directory doesn't exist or can't be read
    if (err.code !== 'ENOENT') {
      console.error('Error scanning local assets:', err);
    }
  }
  
  return results;
}

// Search PolyHaven (reuse existing functionality)
async function searchPolyHaven(query: string, type: string = 'all'): Promise<AssetResult[]> {
  try {
    const base = "https://api.polyhaven.com";
    const url = `${base}/assets?t=${encodeURIComponent(type)}`;
    const res = await fetch(url);
    
    if (!res.ok) return [];
    
    const data = (await res.json()) as Record<string, any>;
    const results: AssetResult[] = [];
    
    for (const [id, asset] of Object.entries(data)) {
      const name = asset.name || id;
      let assetType: AssetResult['type'] = 'unknown';
      
      if (type === 'hdris' || asset.type === 'hdri') assetType = 'hdri';
      else if (type === 'textures' || asset.type === 'texture') assetType = 'texture';
      else if (type === 'models' || asset.type === 'model') assetType = 'model';
      
      results.push({
        name,
        source: 'polyhaven',
        type: assetType,
        url: `https://polyhaven.com/a/${id}`,
        description: asset.categories?.join(', ') || '',
        score: 0
      });
    }
    
    return results;
  } catch (err) {
    console.error('PolyHaven search error:', err);
    return [];
  }
}

// Search Poly Pizza (free Google Poly archive)
async function searchPolyPizza(query: string): Promise<AssetResult[]> {
  try {
    // Note: Poly Pizza is a static archive, so we do client-side filtering
    // In a real implementation, you'd use their API or search endpoint
    const searchUrl = `https://poly.pizza/search?q=${encodeURIComponent(query)}`;
    
    // For now, return placeholder that tells user to visit the site
    return [{
      name: `Search "${query}" on Poly Pizza`,
      source: 'poly-pizza',
      type: 'model',
      url: searchUrl,
      description: 'Visit Poly Pizza to search for free 3D models from the Google Poly archive',
      score: 0
    }];
  } catch (err) {
    return [];
  }
}

export function registerAssetDiscoveryTools(server: Server) {
  // search_ar_assets - Unified asset search
  server.tool(
    "search_ar_assets",
    "Search for AR assets across multiple sources (PolyHaven, local assets, Poly Pizza). Returns ranked results.",
    {
      query: z.string().describe("Search query (e.g., 'dragon', 'wood texture', 'sunset hdri')"),
      sources: z.array(z.enum(['polyhaven', 'local', 'poly-pizza', 'all'])).optional().default(['all']).describe("Sources to search"),
      type: z.enum(['model', 'texture', 'hdri', 'audio', 'all']).optional().default('all').describe("Type of asset to search for"),
      limit: z.number().optional().default(20).describe("Maximum number of results per source")
    },
    async (args: any) => {
      const query = String(args.query);
      const sources = args.sources || ['all'];
      const type = args.type || 'all';
      const limit = Number(args.limit || 20);
      
      const shouldSearchSource = (source: string) => 
        sources.includes('all') || sources.includes(source);
      
      let allResults: AssetResult[] = [];
      
      // Search local assets
      if (shouldSearchSource('local')) {
        const localResults = await searchLocalAssets(query);
        allResults.push(...localResults);
      }
      
      // Search PolyHaven
      if (shouldSearchSource('polyhaven')) {
        let polyType = 'all';
        if (type === 'hdri') polyType = 'hdris';
        else if (type === 'texture') polyType = 'textures';
        else if (type === 'model') polyType = 'models';
        
        const polyResults = await searchPolyHaven(query, polyType);
        allResults.push(...polyResults);
      }
      
      // Search Poly Pizza
      if (shouldSearchSource('poly-pizza')) {
        const pizzaResults = await searchPolyPizza(query);
        allResults.push(...pizzaResults);
      }
      
      // Filter by type if specified
      if (type !== 'all') {
        allResults = allResults.filter(r => r.type === type);
      }
      
      // Rank results
      const rankedResults = rankResults(allResults, query);
      
      // Limit results
      const limitedResults = rankedResults.slice(0, limit);
      
      if (limitedResults.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No results found for "${query}"\n\n💡 Try:\n  • Different search terms\n  • Broader type filter\n  • Adding assets to your local assets/ directory`
            }
          ]
        };
      }
      
      // Format results
      const output = limitedResults.map((result, index) => {
        const sourceIcon = {
          'polyhaven': '🌐',
          'local': '📁',
          'poly-pizza': '🍕',
          'sketchfab': '🎨'
        }[result.source] || '📦';
        
        const typeIcon = {
          'model': '🎭',
          'texture': '🖼️',
          'hdri': '🌅',
          'audio': '🔊',
          'unknown': '❓'
        }[result.type] || '📦';
        
        let details = `${index + 1}. ${sourceIcon} ${typeIcon} ${result.name}`;
        if (result.description) details += `\n   ${result.description}`;
        if (result.source === 'local') details += `\n   Path: ${result.url}`;
        else if (result.url) details += `\n   URL: ${result.url}`;
        if (result.fileSize) details += `\n   Size: ${result.fileSize}`;
        if (result.formats) details += `\n   Formats: ${result.formats.join(', ')}`;
        
        return details;
      }).join('\n\n');
      
      return {
        content: [
          {
            type: "text",
            text: `Found ${limitedResults.length} result(s) for "${query}":\n\n${output}\n\n💡 To use a result:\n  • Local assets: Use desktop_add_model with the path\n  • PolyHaven: Use assets_polyhaven_files to get download URLs\n  • Poly Pizza: Visit the URL to download manually\n\nResults JSON:\n${JSON.stringify({ query, total: limitedResults.length, results: limitedResults }, null, 2)}`
          }
        ]
      };
    }
  );

  // get_asset_download_info - Get download information for an asset
  server.tool(
    "get_asset_download_info",
    "Get detailed download information for a specific asset from PolyHaven",
    {
      assetId: z.string().describe("Asset ID from PolyHaven (e.g., 'damaged_helmet')"),
      resolution: z.string().optional().describe("Preferred resolution (e.g., '1k', '2k', '4k')"),
      format: z.string().optional().describe("Preferred format (e.g., 'glb', 'fbx', 'hdr')")
    },
    async (args: any) => {
      const assetId = String(args.assetId);
      
      try {
        const url = `https://api.polyhaven.com/files/${encodeURIComponent(assetId)}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Could not find asset "${assetId}" on PolyHaven`
              }
            ],
            isError: true
          };
        }
        
        const files = await res.json();
        const resolution = args.resolution || 'auto';
        const format = args.format || 'auto';
        
        // Find best matching file
        let downloadUrl = '';
        let fileInfo = '';
        
        // Try to extract relevant file information
        const fileKeys = Object.keys(files);
        if (fileKeys.length > 0) {
          fileInfo = `Available formats: ${fileKeys.join(', ')}`;
          
          // Try to find a good default download
          for (const key of fileKeys) {
            if (typeof files[key] === 'object') {
              const resolutions = Object.keys(files[key]);
              if (resolutions.length > 0) {
                const bestRes = resolution !== 'auto' && files[key][resolution] 
                  ? resolution 
                  : resolutions[0];
                if (files[key][bestRes]?.url) {
                  downloadUrl = files[key][bestRes].url;
                  fileInfo += `\n   Selected: ${key} at ${bestRes}`;
                  break;
                }
              }
            }
          }
        }
        
        return {
          content: [
            {
              type: "text",
              text: `📦 Asset: ${assetId}\n${fileInfo}${downloadUrl ? `\n\n💾 Download URL: ${downloadUrl}\n\n💡 Use assets_download_url to download this file` : '\n\n⚠️  No direct download URL found - check the files JSON below'}\n\nFiles JSON:\n${JSON.stringify(files, null, 2)}`
            }
          ]
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error fetching asset info: ${err.message}`
            }
          ],
          isError: true
        };
      }
    }
  );
}

