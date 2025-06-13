import fs from 'fs';
import path from 'path';
import cloudinary from './cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

async function uploadFile(filePath, publicId, resourceType = 'image') {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: resourceType,
    public_id: publicId,
    folder: `toorich/objects/${publicId.split('/')[0]}`,
    overwrite: true,
  });
  return result.secure_url;
}

async function registerObject(objectCode) {
  try {
    const folder = path.resolve('assets', 'objects', objectCode);
    const metaPath = path.join(folder, 'meta.json');

    if (!fs.existsSync(metaPath)) {
      throw new Error(`Archivo meta.json no encontrado para objeto: ${objectCode}`);
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

    console.log(`📂 Procesando objeto: ${objectCode}`);

    const videoUrl = await uploadFile(path.join(folder, 'video.mp4'), `${objectCode}/video`, 'video');
    console.log('✅ video.mp4 subido');

    const thumbnailUrl = await uploadFile(path.join(folder, 'thumbnail.jpg'), `${objectCode}/thumbnail`);
    console.log('✅ thumbnail.jpg subido');

    const objectUrl = await uploadFile(path.join(folder, 'object.png'), `${objectCode}/object`);
    console.log('✅ object.png subido');

    const finalData = {
      ...meta,
      code: objectCode,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      object_url: objectUrl,
    };

    const outputPath = path.join(folder, 'final.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');

    console.log(`🎉 Registro completo. Archivo generado en ${outputPath}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  }
}

// Read argument from command line
const args = process.argv.slice(2);
if (!args[0]) {
  console.error('❌ You must pass the object code. Example: node registerObject.js JY004_SkyDragonGX700');
  process.exit(1);
}

registerObject(args[0]);
