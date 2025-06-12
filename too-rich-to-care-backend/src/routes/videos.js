import express from 'express';
import fs from 'fs';
import path from 'path';

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

export default router;
