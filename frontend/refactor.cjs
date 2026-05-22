const fs = require('fs');
const path = require('path');

const files = [
  'InventoryPage.tsx',
  'ProductManagement.tsx',
  'AddNewProduct.tsx',
  'Categories.tsx'
].map(f => path.join('src/pages/inventory', f));

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace <aside>...</aside> with <Sidebar />
    const asideRegex = new RegExp('<aside[\\s\\S]*?<\\/aside>', 'g');
    content = content.replace(asideRegex, '<Sidebar />');
    
    // Add import statement at the top
    if (!content.includes('import Sidebar')) {
      const importRegex = new RegExp('^import', 'm');
      content = content.replace(importRegex, "import Sidebar from './Sidebar';\nimport");
    }
    
    fs.writeFileSync(f, content, 'utf8');
    console.log('Refactored ' + f);
  }
});
