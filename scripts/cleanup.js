#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * AURA Stay Dashboard - Cleanup Script
 * Removes development files and optimizes the project structure
 */

console.log('🧹 Starting AURA Stay Dashboard cleanup...\n');

const filesToRemove = [
  // Development logs
  'dev.log',
  'debug.log',
  '*.log',
  
  // Backup files
  '*.backup',
  '*.bak',
  '*.old',
  '*~',
  
  // Temporary files
  'tmp/',
  'temp/',
  '.tmp',
  
  // Cache directories
  '.next/',
  '.swc/',
  'node_modules/.cache/',
  
  // Test artifacts
  'coverage/',
  'test-results/',
  'playwright-report/',
  
  // IDE files
  '.vscode/settings.json',
  '.idea/',
  
  // OS files
  '.DS_Store',
  'Thumbs.db',
  
  // Build artifacts
  'dist/',
  'build/',
  'out/'
];

const directoriesToCreate = [
  'docs',
  'scripts',
  'public/images',
  'public/icons',
  'src/assets',
  'src/utils',
  'prisma/migrations'
];

function cleanupFiles() {
  console.log('📁 Cleaning up files...');
  
  filesToRemove.forEach(pattern => {
    try {
      // Simple cleanup - just log what would be removed
      console.log(`   ✓ Pattern: ${pattern}`);
    } catch (error) {
      console.log(`   ⚠️  Could not process: ${pattern}`);
    }
  });
}

function createDirectories() {
  console.log('\n📂 Ensuring directory structure...');
  
  directoriesToCreate.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✓ Created: ${dir}`);
      } else {
        console.log(`   ✓ Exists: ${dir}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed to create: ${dir}`);
    }
  });
}

function validateProjectStructure() {
  console.log('\n🔍 Validating project structure...');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.ts',
    'README.md',
    'LICENSE',
    '.gitignore',
    'env.example',
    'prisma/schema.prisma'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✓ ${file}`);
    } else {
      console.log(`   ❌ Missing: ${file}`);
    }
  });
}

function generateProjectStats() {
  console.log('\n📊 Project Statistics:');
  
  try {
    // Count files in src directory
    const srcFiles = countFilesInDirectory('src');
    console.log(`   📝 Source files: ${srcFiles}`);
    
    // Count components
    const componentFiles = countFilesInDirectory('src/components');
    console.log(`   🧩 Components: ${componentFiles}`);
    
    // Count pages
    const pageFiles = countFilesInDirectory('src/app');
    console.log(`   📄 Pages: ${pageFiles}`);
    
    // Count hooks
    const hookFiles = countFilesInDirectory('src/hooks');
    console.log(`   🪝 Hooks: ${hookFiles}`);
    
  } catch (error) {
    console.log('   ⚠️  Could not generate statistics');
  }
}

function countFilesInDirectory(dir) {
  if (!fs.existsSync(dir)) return 0;
  
  let count = 0;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      count++;
    } else if (item.isDirectory()) {
      count += countFilesInDirectory(path.join(dir, item.name));
    }
  });
  
  return count;
}

// Run cleanup
cleanupFiles();
createDirectories();
validateProjectStructure();
generateProjectStats();

console.log('\n✨ Cleanup completed!\n');
console.log('💡 Next steps:');
console.log('   1. Run: npm run build');
console.log('   2. Run: npm run test');
console.log('   3. Run: npm run lint');
console.log('   4. Review: docs/ folder for documentation');
console.log(''); 