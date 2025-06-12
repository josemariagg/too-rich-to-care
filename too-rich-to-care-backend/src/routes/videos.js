import express from 'express';
import fs from 'fs';
import path from 'path';
import cloudinary from '../../cloudinary.js';

const router = express.Router();
const videosDir = path.resolve('too-rich-to-care-backend/videos');

router.get('/:cartId', (req, res) => {
  const { cartId } = req.params;
  const videoPath = path.join(videosDir, `${cartId}.mp4`);

  fs.access(videoPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.sendFile(videoPath);
  });
});

router.head('/:cartId', (req, res) => {
  const { cartId } = req.params;
  const videoPath = path.join(videosDir, `${cartId}.mp4`);

  fs.access(videoPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).end();
    }
    res.status(200).end();
  });
});

router.post('/generate', async (req, res) => {
  const { cartId, email, selfie } = req.body;
  if (!cartId || !email || !selfie) {
    return res.status(400).json({ error: 'cartId, email and selfie are required' });
  }
  try {
    let selfieUrl = selfie;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const upload = await cloudinary.uploader.upload(selfie, {
        folder: 'selfies',
        public_id: cartId,
        overwrite: true,
      });
      selfieUrl = upload.secure_url;
    }

    if (process.env.VIDEO_POD_URL) {
      await fetch(process.env.VIDEO_POD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, email, selfieUrl }),
      });
    }

    res.json({ message: 'Video generation requested' });
  } catch (err) {
    console.error('Error generating video:', err);
    res.status(500).json({ error: 'failed to generate video' });
  }
});

export default router;
