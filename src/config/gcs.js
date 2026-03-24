'use strict';

const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
});

// ✅ Multer storage (local OR GCS)
function getMulterStorage() {

  // 🟢 LOCAL (DEV)
  if (process.env.NODE_ENV !== 'production') {
    const multer = require('multer');

    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'public/images/products');
      },
      filename: (req, file, cb) => {
        req.session.multer = (req.session.multer || 0) + 1;
        cb(null, `${req.body.id}-${req.session.multer}${path.extname(file.originalname)}`);
      },
    });
  }

  // 🔵 PRODUCTION (GCS)
  return {
    _handleFile(req, file, cb) {
      const bucketName = process.env.GCS_BUCKET_UPLOADS;

      if (!bucketName) {
        return cb(new Error('GCS_BUCKET_UPLOADS not set'));
      }

      const bucket = storage.bucket(bucketName);
      const fileName = `products/${uuidv4()}${path.extname(file.originalname)}`;
      const blob = bucket.file(fileName);

      const stream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      file.stream.pipe(stream)
        .on('error', (err) => cb(err))
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          req.uploadedUrl = publicUrl;

          cb(null, {
            path: publicUrl,
            filename: fileName,
          });
        });
    },

    _removeFile(req, file, cb) {
      cb(null);
    },
  };
}

// ✅ Upload buffer (used for programmatic uploads)
async function uploadBuffer(buffer, mimetype, folder = 'uploads') {
  const bucketName = process.env.GCS_BUCKET_UPLOADS;

  if (!bucketName) {
    throw new Error('GCS_BUCKET_UPLOADS not set');
  }

  const bucket = storage.bucket(bucketName);
  const fileName = `${folder}/${uuidv4()}`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    contentType: mimetype,
    resumable: false,
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

module.exports = {
  getMulterStorage,
  uploadBuffer,
  storage,
};