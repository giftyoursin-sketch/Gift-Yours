import fs from 'fs';
import path from 'path';

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if(fs.statSync(full).isDirectory()) walk(full);
    else if(full.endsWith('.jsx')) {
      let content = fs.readFileSync(full, 'utf8');
      if(content.includes('"/business')) {
        content = content.replace(/"\/business/g, '`${window.location.hostname.includes(\'e-commerce\') ? \'/business\' : \'\'}');
        fs.writeFileSync(full, content);
        console.log('Updated', full);
      }
    }
  });
}
walk('Business Management');
