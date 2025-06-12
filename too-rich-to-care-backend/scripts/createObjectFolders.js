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

// Ruta base absoluta para crear carpetas
const baseDir = path.join(__dirname, '..', 'assets', 'objects');

for (const id of objectIds) {
  const folder = path.join(baseDir, id);
  fs.mkdirSync(folder, { recursive: true });

  // Archivos base para cada carpeta con contenido inicial
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

  // Archivo .gitkeep para asegurar que la carpeta se suba aunque esté vacía
  const gitkeepPath = path.join(folder, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }

  console.log(`✅ Carpeta creada: ${folder}`);
}
