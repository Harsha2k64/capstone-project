console.log('=== DEBUG ENV ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('================');

'use strict';

const path = require('path');
require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const config = {
  root:        path.join(__dirname, '/../../'),
  views:       path.join(__dirname, '/../views'),
  controllers: path.join(__dirname, '/../controllers'),

  // ✅ SQL SERVER CONFIG (REPLACED ONLY THIS PART)
  sqlCon: {
    user: 'sqlserver',
    password: 'Dontask.123',
    server: process.env.DB_HOST,   // Cloud SQL private IP
    database: 'ecommerceserver',
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  },

  // ❌ REMOVE populateCon (MySQL only)
  // (delete this block completely)

  // ── GCP (KEEP SAME) ───────────────────────────
  gcp: {
    projectId:     process.env.GCP_PROJECT_ID      || '',
    region:        process.env.GCP_REGION          || 'us-central1',
    bucketAssets:  process.env.GCS_BUCKET_NAME     || '',
    bucketUploads: process.env.GCS_BUCKET_UPLOADS  || '',
    pubsubTopic:   process.env.PUBSUB_TOPIC_ORDERS || 'order-events',
    sqlConnection: process.env.CLOUDSQL_CONNECTION_NAME || '',
  },
};

module.exports = config;