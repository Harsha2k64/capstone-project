'use strict';

const { Storage } = require('@google-cloud/storage');
const path        = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = new Storage({ projectId: process.env.GCP_PROJECT_ID });

// Multer storage engine that uploads directly to GCS
// Falls back to local disk in development
function getMulterStorage() {
  if (process.env.NODE_ENV !== 'production') {
    const multer = require('multer');
    return multer.diskStorage({
      destination: (req, file, cb) => cb(null, 'public/images/products'),
      filename:    (req, file, cb) => {
        req.session.multer = (req.session.multer || 0) + 1;
        cb(null, req.body.id + '-' + req.session.multer);
      },
    });
  }

  // Production: stream to GCS
  const { Storage: GCSStorage } = require('@google-cloud/storage');
  const multer = require('multer');

  return {
    _handleFile(req, file, cb) {
      const bucket   = storage.bucket(process.env.GCS_BUCKET_UPLOADS || 'your-bucket');
      const fileName = `products/${uuidv4()}${path.extname(file.originalname)}`;
      const blob     = bucket.file(fileName);
      const stream   = blob.createWriteStream({ resumable: false, contentType: file.mimetype });

      file.stream.pipe(stream)
        .on('error', cb)
        .on('finish', () => {
          req.uploadedUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          cb(null, { path: req.uploadedUrl, filename: fileName });
        });
    },
    _removeFile(req, file, cb) { cb(null); },
  };
}

async function uploadBuffer(buffer, mimetype, folder = 'uploads') {
  const bucket   = storage.bucket(process.env.GCS_BUCKET_UPLOADS || 'your-bucket');
  const fileName = `${folder}/${uuidv4()}`;
  const file     = bucket.file(fileName);
  await file.save(buffer, { contentType: mimetype, resumable: false });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

module.exports = { getMulterStorage, uploadBuffer, storage };