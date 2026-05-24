const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));
let count = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/app/api/auth/[...nextauth]/route')) {
    const newContent = content.replace(
      /import\s+\{\s*authOptions\s*\}\s+from\s+['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route['"]/g,
      'import { authOptions } from "@/lib/auth/auth-options"'
    );
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      count++;
      console.log('Updated', file);
    }
  }
});

console.log(`Updated ${count} files.`);
