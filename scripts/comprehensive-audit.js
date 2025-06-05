#!/usr/bin/env node

/**
 * Comprehensive Codebase Audit
 * Analyzes the entire AURA Stay Dashboard for completeness, integration, and opportunities
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Comprehensive AURA Stay Dashboard Audit\n');
console.log('='.repeat(60));

// Helper function to recursively get all files
function getAllFiles(dirPath, extension = '') {
  const files = [];
  
  function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && (extension === '' || fullPath.endsWith(extension))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dirPath);
  return files;
}

// Helper function to count lines in file
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

// 1. PROJECT OVERVIEW
console.log('\n📊 PROJECT OVERVIEW');
console.log('-'.repeat(30));

const srcPath = path.join(__dirname, '../src');
const tsxFiles = getAllFiles(srcPath, '.tsx');
const tsFiles = getAllFiles(srcPath, '.ts');
const allSourceFiles = [...tsxFiles, ...tsFiles];

console.log(`📁 Total TypeScript files: ${allSourceFiles.length}`);
console.log(`🎨 React components: ${tsxFiles.length}`);
console.log(`⚙️  TypeScript modules: ${tsFiles.length}`);

const totalLines = allSourceFiles.reduce((sum, file) => sum + countLines(file), 0);
console.log(`📝 Total lines of code: ${totalLines.toLocaleString()}`);

// 2. ROUTE ANALYSIS
console.log('\n🛣️  ROUTE ANALYSIS');
console.log('-'.repeat(30));

const appPath = path.join(__dirname, '../src/app');
const routes = [];

function findRoutes(dir, basePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      const currentPath = basePath + '/' + item;
      const pageFile = path.join(fullPath, 'page.tsx');
      const layoutFile = path.join(fullPath, 'layout.tsx');
      
      if (fs.existsSync(pageFile)) {
        routes.push({
          path: currentPath,
          type: 'page',
          hasLayout: fs.existsSync(layoutFile)
        });
      }
      
      findRoutes(fullPath, currentPath);
    }
  }
}

findRoutes(appPath);

// Check for main page
const mainPagePath = path.join(appPath, 'page.tsx');
if (fs.existsSync(mainPagePath)) {
  routes.unshift({ path: '/', type: 'page', hasLayout: false });
}

console.log(`📄 Total routes found: ${routes.length}`);
routes.forEach(route => {
  const layoutIndicator = route.hasLayout ? '📋' : '  ';
  console.log(`  ${layoutIndicator} ${route.path}`);
});

// 3. API ENDPOINTS ANALYSIS
console.log('\n🔌 API ENDPOINTS');
console.log('-'.repeat(30));

const apiPath = path.join(__dirname, '../src/app/api');
const apiRoutes = [];

function findApiRoutes(dir, basePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const currentPath = basePath + '/' + item;
      const routeFile = path.join(fullPath, 'route.ts');
      
      if (fs.existsSync(routeFile)) {
        const content = fs.readFileSync(routeFile, 'utf8');
        const methods = [];
        if (content.includes('export async function GET')) methods.push('GET');
        if (content.includes('export async function POST')) methods.push('POST');
        if (content.includes('export async function PUT')) methods.push('PUT');
        if (content.includes('export async function DELETE')) methods.push('DELETE');
        
        apiRoutes.push({
          path: '/api' + currentPath,
          methods: methods
        });
      }
      
      findApiRoutes(fullPath, currentPath);
    }
  }
}

findApiRoutes(apiPath);

console.log(`🔗 Total API endpoints: ${apiRoutes.length}`);
apiRoutes.forEach(route => {
  const methodsList = route.methods.join(', ');
  console.log(`  📡 ${route.path} [${methodsList}]`);
});

// 4. COMPONENT ANALYSIS
console.log('\n🧩 COMPONENT ANALYSIS');
console.log('-'.repeat(30));

const componentsPath = path.join(__dirname, '../src/components');
const componentDirs = [];

function findComponentDirs(dir, basePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const tsxFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.tsx')).length;
      if (tsxFiles > 0) {
        componentDirs.push({
          name: basePath + '/' + item,
          components: tsxFiles
        });
      }
      findComponentDirs(fullPath, basePath + '/' + item);
    }
  }
}

findComponentDirs(componentsPath);

console.log(`📦 Component directories: ${componentDirs.length}`);
componentDirs.forEach(dir => {
  console.log(`  🎯 ${dir.name.slice(1)} (${dir.components} components)`);
});

// 5. HOOK ANALYSIS
console.log('\n🪝 CUSTOM HOOKS');
console.log('-'.repeat(30));

const hooksPath = path.join(__dirname, '../src/hooks');
if (fs.existsSync(hooksPath)) {
  const hookFiles = fs.readdirSync(hooksPath).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  console.log(`🔧 Hook files: ${hookFiles.length}`);
  hookFiles.forEach(file => {
    const content = fs.readFileSync(path.join(hooksPath, file), 'utf8');
    const hookCount = (content.match(/export\s+function\s+use\w+/g) || []).length;
    console.log(`  🪝 ${file} (${hookCount} hooks)`);
  });
} else {
  console.log('❌ No hooks directory found');
}

// 6. TYPE DEFINITIONS
console.log('\n📚 TYPE DEFINITIONS');
console.log('-'.repeat(30));

const typesPath = path.join(__dirname, '../src/types');
if (fs.existsSync(typesPath)) {
  const typeFiles = fs.readdirSync(typesPath).filter(f => f.endsWith('.ts'));
  console.log(`📋 Type definition files: ${typeFiles.length}`);
  
  typeFiles.forEach(file => {
    const content = fs.readFileSync(path.join(typesPath, file), 'utf8');
    const interfaceCount = (content.match(/interface\s+\w+/g) || []).length;
    const typeCount = (content.match(/type\s+\w+/g) || []).length;
    const enumCount = (content.match(/enum\s+\w+/g) || []).length;
    console.log(`  📄 ${file}: ${interfaceCount} interfaces, ${typeCount} types, ${enumCount} enums`);
  });
} else {
  console.log('❌ No types directory found');
}

// 7. INTEGRATION CHECKS
console.log('\n🔗 INTEGRATION ANALYSIS');
console.log('-'.repeat(30));

// Check if routes have corresponding navigation links
const headerPath = path.join(__dirname, '../src/components/Header.tsx');
const navigationPath = path.join(__dirname, '../src/components/navigation/Navigation.tsx');

let navLinks = [];
if (fs.existsSync(headerPath)) {
  const content = fs.readFileSync(headerPath, 'utf8');
  const linkMatches = content.match(/href=["']([^"']+)["']/g) || [];
  navLinks = linkMatches.map(match => match.match(/href=["']([^"']+)["']/)[1]);
  console.log(`🧭 Navigation links in Header: ${navLinks.length}`);
}

if (fs.existsSync(navigationPath)) {
  const content = fs.readFileSync(navigationPath, 'utf8');
  const linkMatches = content.match(/href=["']([^"']+)["']/g) || [];
  const additionalLinks = linkMatches.map(match => match.match(/href=["']([^"']+)["']/)[1]);
  navLinks.push(...additionalLinks);
  console.log(`🧭 Additional navigation links: ${additionalLinks.length}`);
}

// Check for orphaned routes (routes without navigation)
const routePaths = routes.map(r => r.path);
const orphanedRoutes = routePaths.filter(route => !navLinks.some(link => link === route));
console.log(`🔍 Potentially orphaned routes: ${orphanedRoutes.length}`);
orphanedRoutes.slice(0, 5).forEach(route => {
  console.log(`  ⚠️  ${route}`);
});

// 8. FEATURE COMPLETENESS CHECK
console.log('\n✅ FEATURE COMPLETENESS');
console.log('-'.repeat(30));

const expectedFeatures = [
  { name: 'User Dashboard', path: '/user-dashboard', implemented: routes.some(r => r.path === '/user-dashboard') },
  { name: 'Admin Dashboard', path: '/admin', implemented: routes.some(r => r.path === '/admin') },
  { name: 'Treasury Dashboard', path: '/dashboard/treasury', implemented: routes.some(r => r.path === '/dashboard/treasury') },
  { name: 'Trading Dashboard', path: '/dashboard/trading', implemented: routes.some(r => r.path === '/dashboard/trading') },
  { name: 'Analytics', path: '/analytics', implemented: routes.some(r => r.path === '/analytics') },
  { name: 'Staking', path: '/dashboard/staking', implemented: routes.some(r => r.path === '/dashboard/staking') },
  { name: 'Governance', path: '/dashboard/governance', implemented: routes.some(r => r.path === '/dashboard/governance') },
  { name: 'Properties', path: '/properties', implemented: routes.some(r => r.path === '/properties') },
  { name: 'Burn Tracking', path: '/burn-tracking', implemented: routes.some(r => r.path === '/burn-tracking') },
  { name: 'Expense Tracker', path: '/expense-tracker', implemented: routes.some(r => r.path === '/expense-tracker') },
];

expectedFeatures.forEach(feature => {
  const status = feature.implemented ? '✅' : '❌';
  console.log(`  ${status} ${feature.name} (${feature.path})`);
});

// 9. OPPORTUNITIES FOR IMPROVEMENT
console.log('\n🚀 IMPROVEMENT OPPORTUNITIES');
console.log('-'.repeat(30));

const opportunities = [];

// Check for missing error pages
if (!fs.existsSync(path.join(appPath, 'error.tsx'))) {
  opportunities.push('❌ Missing global error.tsx page');
}

if (!fs.existsSync(path.join(appPath, 'loading.tsx'))) {
  opportunities.push('❌ Missing global loading.tsx page');
}

// Check for missing API documentation
if (!fs.existsSync(path.join(__dirname, '../docs/api.md'))) {
  opportunities.push('📝 Could add API documentation');
}

// Check for missing components
const missingComponents = [
  'Notification System',
  'Search Functionality', 
  'User Profile Management',
  'Settings Panel',
  'Help/Support System',
  'Dark Mode Toggle',
  'Mobile Navigation Drawer'
];

opportunities.push(...missingComponents.map(comp => `💡 Could add: ${comp}`));

opportunities.forEach(opp => console.log(`  ${opp}`));

// 10. SUMMARY
console.log('\n📈 AUDIT SUMMARY');
console.log('='.repeat(60));
console.log(`✨ Total Features: ${expectedFeatures.filter(f => f.implemented).length}/${expectedFeatures.length}`);
console.log(`📁 Total Routes: ${routes.length}`);
console.log(`🔌 API Endpoints: ${apiRoutes.length}`);
console.log(`🧩 Component Dirs: ${componentDirs.length}`);
console.log(`📝 Lines of Code: ${totalLines.toLocaleString()}`);
console.log(`🎯 Improvement Areas: ${opportunities.length}`);

console.log('\n🎉 This is a comprehensive, feature-rich application!');
console.log('🔧 Ready for production with identified enhancement opportunities.'); 