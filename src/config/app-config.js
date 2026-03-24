'use strict';

require('dotenv').config();  // ✅ MUST BE FIRST

const path = require('path');

console.log('=== DEBUG ENV ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('================');

const config = {
  root:        path.join(__dirname, '/../../'),
  views:       path.join(__dirname, '/../views'),
  controllers: path.join(__dirname, '/../controllers'),

  // ✅ SQL SERVER CONFIG (FINAL)
  sqlCon: {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  },

  // ── GCP (KEEP SAME) ───────────────────────────
  gcp: {
    projectId:     process.env.GCP_PROJECT_ID      || '',
    region:        process.env.GCP_REGION          || 'us-central1',
    bucketAssets:  process.env.GCS_BUCKET_NAME     || '',
    bucketUploads: process.env.GCS_BUCKET_UPLOADS  || '',
    pubsubTopic:   process.env.PUBSUB_TOPIC_ORDERS || 'order-events',
    sqlConnection: process.env.CLOUD_SQL_CONNECTION_NAME || '',
  },
};

module.exports = config;