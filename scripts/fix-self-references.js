const fs = require('fs');
const path = require('path');

const vendorsPath = path.join(process.cwd(), '.next/server/vendors.js');

try {
  if (fs.existsSync(vendorsPath)) {
    let content = fs.readFileSync(vendorsPath, 'utf8');
    
    // Replace self references with globalThis fallback
    const originalContent = content;
    content = content.replace(
      /\bself\b/g,
      '(typeof globalThis !== "undefined" ? globalThis : global)'
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(vendorsPath, content, 'utf8');
      console.log('✅ Fixed self references in vendors.js');
    } else {
      console.log('ℹ️  No self references found in vendors.js');
    }
  } else {
    console.log('ℹ️  vendors.js not found, skipping fix');
  }
} catch (error) {
  console.error('❌ Error fixing self references:', error.message);
  process.exit(1);
} 