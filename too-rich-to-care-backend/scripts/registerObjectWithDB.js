import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cloudinary from '../cloudinary.js';
import pkg from 'pg';
const { Client } = pkg;

dotenv.config();

async function uploadFile(filePath, publicId, resourceType = 'image') {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: resourceType,
    public_id: `toorich/objects/${publicId}`,
    overwrite: true,
  });
  return result.secure_url;
}

async function registerObject(objectCode) {
  try {
    const folder = path.resolve('assets', 'objects', objectCode);
    const metaPath = path.join(folder, 'meta.json');

    if (!fs.existsSync(metaPath)) {
      throw new Error(`meta.json no encontrado para objeto: ${objectCode}`);
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

    console.log(`📂 Procesando objeto: ${objectCode}`);

    // Subida de archivos a Cloudinary
    const videoUrl = await uploadFile(path.join(folder, 'video.mp4'), `${objectCode}/video`, 'video');
    console.log('✅ video.mp4 subido');

    const thumbnailUrl = await uploadFile(path.join(folder, 'thumbnail.jpg'), `${objectCode}/thumbnail`);
    console.log('✅ thumbnail.jpg subido');

    const objectUrl = await uploadFile(path.join(folder, 'object.png'), `${objectCode}/object`);
    console.log('✅ object.png subido');

    // Construcción de datos finales para DB
    const finalData = {
      ...meta,
      code: objectCode,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      object_url: objectUrl,
    };

    // Asegurarse de tener un ID único para la tabla (meta debe tener id o usar otro campo)
    if (!finalData.id) {
      finalData.id = objectCode; // fallback a objectCode si id no existe en meta.json
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    await client.connect();

    const query = `
      INSERT INTO items (id, code, name, category, price, video_url, thumbnail_url, object_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        video_url = EXCLUDED.video_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        object_url = EXCLUDED.object_url
    `;

    const values = [
      finalData.id,
      finalData.code,
      finalData.name,
      finalData.category,
      finalData.price,
      finalData.video_url,
      finalData.thumbnail_url,
      finalData.object_url,
    ];

    await client.query(query, values);
    await client.end();

    console.log(`📥 Guardado en base de datos objeto ${finalData.id}`);

    // Guardar final.json actualizado con URLs subidas
    const outputPath = path.join(folder, 'final.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log(`🎉 Registro completo. Archivo generado en ${outputPath}`);

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

const args = process.argv.slice(2);
if (!args[0]) {
  console.error('❌ Debes pasar el código del objeto. Ej: node scripts/registerObjectWithDB.js JY004_SkyDragonGX700');
  process.exit(1);
}

registerObject(args[0]);
