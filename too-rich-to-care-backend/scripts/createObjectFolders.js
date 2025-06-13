import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Permite usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de objetos — completa o importa desde otro lado si quieres
const objectIds = [
  'JY001_Falconaire10X',
  'JY002_TitanJet7500X',
  'CH002_MercedesBenz300SL',
];

// Absolute base path to create folders
const baseDir = path.join(__dirname, '..', 'assets', 'objects');

for (const id of objectIds) {
  const folder = path.join(baseDir, id);
  fs.mkdirSync(folder, { recursive: true });

  // Base files for each folder with initial content
  const files = {
    'video.mp4': '',
    'thumbnail.jpg': '',
    'object.png': '',
    'meta.json': JSON.stringify({ id, name: '', category: '', price: 0 }, null, 2),
  };

  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(folder, fileName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
    }
  }

  // .gitkeep file to ensure the folder is committed even if empty
  const gitkeepPath = path.join(folder, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }

  console.log(`✅ Folder created: ${folder}`);
}
