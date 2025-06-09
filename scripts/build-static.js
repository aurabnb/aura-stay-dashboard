#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Critical polyfills - apply immediately
if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  if (typeof global.window === 'undefined') {
    global.window = global;
  }
  if (!global.webpackChunk_N_E) {
    global.webpackChunk_N_E = [];
  }
}

if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  if (!globalThis.webpackChunk_N_E) {
    globalThis.webpackChunk_N_E = [];
  }
}

const apiPath = path.join(process.cwd(), 'src/app/api');
const apiBackupPath = path.join(process.cwd(), 'api.backup');

console.log('🔧 Starting static build with API route handling...');

// Function to rename API folder
function disableApiRoutes() {
  if (fs.existsSync(apiPath)) {
    console.log('📁 Temporarily moving API routes outside app directory...');
    // Ensure backup directory doesn't exist first
    if (fs.existsSync(apiBackupPath)) {
      fs.rmSync(apiBackupPath, { recursive: true, force: true });
    }
    fs.renameSync(apiPath, apiBackupPath);
    console.log('✅ API routes moved outside app directory');
  }
}

// Function to restore API folder
function restoreApiRoutes() {
  if (fs.existsSync(apiBackupPath)) {
    console.log('📁 Restoring API routes to app directory...');
    if (fs.existsSync(apiPath)) {
      fs.rmSync(apiPath, { recursive: true, force: true });
    }
    fs.renameSync(apiBackupPath, apiPath);
    console.log('✅ API routes restored to src/app/api');
  }
}

// Main build process
try {
  // Disable API routes
  disableApiRoutes();
  
  // Run the static build
  console.log('🏗️  Running Next.js static build...');
  execSync('cross-env NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max-old-space-size=4096" SKIP_ENV_VALIDATION=true STATIC_EXPORT=1 next build', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Static build completed successfully!');
  
  // Post-build: Copy routes manifest for Vercel compatibility
  console.log('🔧 Setting up Vercel compatibility...');
  setupVercelCompatibility();
  
  // Post-build: Patch any remaining self references  
  console.log('🔧 Patching generated files...');
  patchGeneratedFiles();
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exitCode = 1;
} finally {
  // Always restore API routes, even if build fails
  restoreApiRoutes();
}

// Function to setup Vercel compatibility
function setupVercelCompatibility() {
  try {
    const outDir = path.join(process.cwd(), 'out');
    const routesManifestSource = path.join(process.cwd(), 'public/routes-manifest.json');
    const routesManifestDest = path.join(outDir, 'routes-manifest.json');
    
    // Ensure out directory exists
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    // Copy routes manifest if it exists
    if (fs.existsSync(routesManifestSource)) {
      fs.copyFileSync(routesManifestSource, routesManifestDest);
      console.log('✅ Routes manifest copied for Vercel compatibility');
    } else {
      console.log('⚠️  Routes manifest not found, Vercel will use defaults');
    }
    
    // Create _next directory for static assets
    const nextDir = path.join(outDir, '_next');
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }
    
  } catch (error) {
    console.warn('⚠️  Failed to setup Vercel compatibility:', error.message);
  }
}

// Function to patch generated files
function patchGeneratedFiles() {
  const vendorsPath = path.join(process.cwd(), '.next/server/vendors.js');
  const webpackRuntimePath = path.join(process.cwd(), '.next/server/webpack-runtime.js');
  
  [vendorsPath, webpackRuntimePath].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Apply comprehensive patches
        content = content
          .replace(/\(self\.webpackChunk_N_E=self\.webpackChunk_N_E\|\|\[\]\)/g, 
            '((typeof self !== "undefined" ? self : globalThis).webpackChunk_N_E=(typeof self !== "undefined" ? self : globalThis).webpackChunk_N_E||[])')
          .replace(/self\.webpackChunk/g, '(typeof self !== "undefined" ? self : globalThis).webpackChunk')
          .replace(/\bself\[/g, '(typeof self !== "undefined" ? self : globalThis)[')
          .replace(/=self\./g, '=(typeof self !== "undefined" ? self : globalThis).');
        
        if (content !== originalContent) {
          // Add polyfill at the beginning
          const polyfill = `// SSR Compatibility Polyfill
if (typeof self === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    globalThis.self = globalThis;
  } else if (typeof global !== 'undefined') {
    global.self = global;
  }
}
`;
          content = polyfill + content;
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Patched ${path.basename(filePath)}`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to patch ${path.basename(filePath)}:`, error.message);
      }
    }
  });
}

console.log('🎉 Static build process completed!'); 