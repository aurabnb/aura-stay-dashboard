#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks for common deployment issues and verifies fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Deployment Configuration...\n');

// Check 1: Verify X-Frame-Options is not in meta tags
console.log('1. Checking X-Frame-Options configuration...');
const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('httpEquiv="X-Frame-Options"')) {
    console.log('❌ X-Frame-Options meta tag found in layout.tsx - this will cause errors');
    console.log('   Remove the meta tag and use HTTP headers only');
  } else {
    console.log('✅ X-Frame-Options meta tag not found');
  }
} else {
  console.log('⚠️  layout.tsx not found');
}

// Check 2: Verify assetPrefix is disabled
console.log('\n2. Checking assetPrefix configuration...');
const configPath = path.join(__dirname, '../next.config.js');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  // Check for active (non-commented) assetPrefix
  const lines = configContent.split('\n');
  const activeAssetPrefix = lines.some(line => 
    line.trim().startsWith('assetPrefix:') && !line.trim().startsWith('//'));
  if (activeAssetPrefix) {
    console.log('❌ assetPrefix is active - this will cause MIME type errors');
    console.log('   Comment out or remove the assetPrefix line');
  } else {
    console.log('✅ assetPrefix is properly disabled');
  }
} else {
  console.log('⚠️  next.config.js not found');
}

// Check 3: Verify manifest.json exists
console.log('\n3. Checking manifest.json...');
const manifestPath = path.join(__dirname, '../public/manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifestContent.name && manifestContent.short_name) {
      console.log('✅ manifest.json exists and is valid');
    } else {
      console.log('⚠️  manifest.json exists but may be incomplete');
    }
  } catch (error) {
    console.log('❌ manifest.json exists but contains invalid JSON');
  }
} else {
  console.log('❌ manifest.json not found - create in public/ directory');
}

// Check 4: Verify polyfills.js exists
console.log('\n4. Checking polyfills.js...');
const polyfillsPath = path.join(__dirname, '../public/polyfills.js');
if (fs.existsSync(polyfillsPath)) {
  console.log('✅ polyfills.js exists');
} else {
  console.log('⚠️  polyfills.js not found but referenced in layout.tsx');
}

// Check 5: Verify security headers in next.config.js
console.log('\n5. Checking security headers...');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (configContent.includes('X-Frame-Options') && configContent.includes('headers()')) {
    console.log('✅ Security headers configured in next.config.js');
  } else {
    console.log('⚠️  Security headers may not be properly configured');
  }
}

// Check 6: Verify required dependencies
console.log('\n6. Checking package.json...');
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const hasNext = packageContent.dependencies?.next || packageContent.devDependencies?.next;
  const hasReact = packageContent.dependencies?.react || packageContent.devDependencies?.react;
  
  if (hasNext && hasReact) {
    console.log('✅ Core dependencies found');
  } else {
    console.log('⚠️  Missing core dependencies');
  }
} else {
  console.log('❌ package.json not found');
}

console.log('\n' + '='.repeat(50));
console.log('📋 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(50));
console.log('✅ = Ready for deployment');
console.log('⚠️  = May cause issues');
console.log('❌ = Will cause deployment errors');
console.log('\n🚀 After fixing any ❌ issues, run:');
console.log('   npm run build && npm start');
console.log('   Then deploy to Vercel'); 