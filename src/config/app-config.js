console.log('=== DEBUG ENV ===');
console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('DATABASE_USER:', process.env.DATABASE_USER);
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

  // ── MySQL / Cloud SQL ──────────────────────────────
  sqlCon: {
    user:     process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASS || '',
    database: process.env.DATABASE_NAME || 'ecommerce',
    charset:  'utf8mb4',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,

    // ✅ TCP for Cloud Run (works reliably)
    host: process.env.DATABASE_HOST || '127.0.0.1',
  },

  populateCon: {
    host:            process.env.DATABASE_HOST || '127.0.0.1',
    user:            process.env.DATABASE_USER || 'root',
    password:        process.env.DATABASE_PASS || '',
    database:        process.env.DATABASE_NAME || 'ecommerce',
    charset:         'utf8mb4',
    multipleStatements: true,
  },

  // ── GCP ───────────────────────────────────────────
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