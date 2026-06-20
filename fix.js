const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  if (content.includes('getServerSession')) {
    content = content.replace(/import \{ getServerSession \} from ['"]next-auth['"];/g, 'import { auth } from "@/auth";');
    content = content.replace(/import \{ getServerSession \} from ['"]next-auth\/next['"];/g, 'import { auth } from "@/auth";');
    content = content.replace(/await getServerSession\(authOptions\)/g, 'await auth()');
    content = content.replace(/await getServerSession\(authOptions\) as any/g, 'await auth() as any');
    content = content.replace(/import \{ authOptions \} from ['"].*?['"];\n/g, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
