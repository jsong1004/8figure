/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PROJECT_ID: process.env.PROJECT_ID,
    DATASET_ID: process.env.DATASET_ID,
    TABLE_ID: process.env.TABLE_ID,
    BIGQUERY_LOCATION: process.env.BIGQUERY_LOCATION,
  },
}

module.exports = nextConfig