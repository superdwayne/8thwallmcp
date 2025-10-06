// Quick script to add AFRAME safety wrapper to all component files
const fs = require('fs');
const path = require('path');

const WRAPPER_START = `// Safe AFRAME registration - waits for load and checks existence
(function() {
  console.log('[MCP] Checking AFRAME availability for component...');
  
  function safeRegister() {
    if (typeof AFRAME === 'undefined') {
      console.error('[MCP] AFRAME is not defined. Please add A-Frame script tag.');
      console.log('[MCP] Add: <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>');
      return false;
    }
    console.log('[MCP] AFRAME detected, registering component...');
    return true;
  }
  
  function registerComponent() {
    if (!safeRegister()) return;
    try {

`;

const WRAPPER_END = `
      console.log('[MCP] Component registered successfully');
    } catch (error) {
      console.error('[MCP] Error registering component:', error);
    }
  }
  
  // Wait for window load event
  if (document.readyState === 'complete') {
    console.log('[MCP] Document already loaded, registering immediately');
    registerComponent();
  } else {
    console.log('[MCP] Waiting for window load event...');
    window.addEventListener('load', function() {
      console.log('[MCP] Window loaded, registering component');
      setTimeout(registerComponent, 100); // Small delay to ensure scene is ready
    });
  }
})();
`;

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));

console.log(`Found ${files.length} component files to update:`);

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already wrapped
  if (content.includes('Safe AFRAME registration')) {
    console.log(`  ⏭️  ${file} - Already wrapped, skipping`);
    return;
  }
  
  // Find the first AFRAME.register line
  const match = content.match(/^(AFRAME\.register(?:Component|System)\()/m);
  if (!match) {
    console.log(`  ⚠️  ${file} - No AFRAME.register found, skipping`);
    return;
  }
  
  // Find all AFRAME.register calls and wrap the entire file content
  const lines = content.split('\n');
  let inRegister = false;
  let braceCount = 0;
  let lastRegisterEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^AFRAME\.register/)) {
      inRegister = true;
      braceCount = 0;
    }
    
    if (inRegister) {
      // Count braces
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // End of register call
      if (braceCount === 0 && line.includes(');')) {
        lastRegisterEnd = i;
        inRegister = false;
      }
    }
  }
  
  if (lastRegisterEnd === -1) {
    console.log(`  ⚠️  ${file} - Couldn't find end of AFRAME.register, skipping`);
    return;
  }
  
  // Find where to insert wrapper (after comments, before first AFRAME line)
  let insertPos = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^AFRAME\.register/)) {
      insertPos = i;
      break;
    }
  }
  
  // Insert wrapper
  const beforeAframe = lines.slice(0, insertPos).join('\n');
  const aframeCode = lines.slice(insertPos, lastRegisterEnd + 1).join('\n');
  const afterAframe = lines.slice(lastRegisterEnd + 1).join('\n');
  
  const wrappedContent = beforeAframe + '\n' + WRAPPER_START + '\n' + aframeCode + WRAPPER_END + afterAframe;
  
  fs.writeFileSync(filePath, wrappedContent, 'utf-8');
  console.log(`  ✅ ${file} - Wrapped successfully`);
});

console.log('\nDone! All component files have been updated.');

