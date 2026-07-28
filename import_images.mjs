import fs from 'fs';
import path from 'path';

const sourceDir = 'c:/Users/valav/Downloads/Gift Yours Web App/E-Commerce/Product images';
const targetDir = 'c:/Users/valav/Downloads/Gift Yours Web App/public/products/photo-frames';

// Helper to convert to slug
function toSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const folders = fs.readdirSync(sourceDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const folder of folders) {
  const folderPath = path.join(sourceDir, folder);
  const slug = toSlug(folder);
  const destFolderPath = path.join(targetDir, slug);

  if (!fs.existsSync(destFolderPath)) {
    fs.mkdirSync(destFolderPath, { recursive: true });
  }

  const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
  
  // Sort files so they are consistent (maybe by name or date)
  files.sort();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourceFile = path.join(folderPath, file);
    
    // Naming convention: cover.webp, gallery-1.webp, gallery-2.webp
    const newName = i === 0 ? 'cover.jpg' : `gallery-${i}.jpg`;
    const destFile = path.join(destFolderPath, newName);

    fs.copyFileSync(sourceFile, destFile);
    console.log(`Copied ${file} to ${slug}/${newName}`);
  }
}
console.log('Finished copying images.');
