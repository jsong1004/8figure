import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getBigQueryClientWithToken } from '@/lib/bigquery';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { days = '30' } = req.query;
    const daysInt = parseInt(days as string);
    const tableName = `\`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\``;
    
    const query = `
      SELECT 
        COUNT(DISTINCT date) as days_with_data,
        SUM(spend) as total_spend,
        SUM(clicks) as total_clicks,
        SUM(impressions) as total_impressions,
        SUM(conversions) as total_conversions,
        ROUND(SUM(spend) / NULLIF(SUM(conversions), 0), 2) as overall_cac,
        ROUND(SUM(spend) / NULLIF(SUM(clicks), 0), 2) as overall_cpc,
        ROUND(SUM(clicks) / NULLIF(SUM(impressions), 0) * 100, 2) as overall_ctr,
        ROUND(SUM(conversions) / NULLIF(SUM(clicks), 0) * 100, 2) as overall_cvr
      FROM ${tableName}
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${daysInt} DAY)
    `;

    // Execute the query with user's access token
    const bigquery = await getBigQueryClientWithToken(session.accessToken as string);
    const [rows] = await bigquery.query({
      query,
      location: process.env.BIGQUERY_LOCATION || 'US',
    });

    res.status(200).json({
      success: true,
      period: `Last ${days} days`,
      metrics: rows[0],
    });

  } catch (error: any) {
    console.error('Metrics query error:', error);
    
    // Handle specific BigQuery errors
    if (error.code === 404) {
      res.status(404).json({ 
        success: false,
        error: 'Dataset or table not found. Please check your BigQuery configuration.',
        code: 'RESOURCE_NOT_FOUND',
        details: {
          message: error.message,
          suggestion: 'Verify your PROJECT_ID, DATASET_ID, and TABLE_ID in the environment variables.'
        }
      });
    } else if (error.code === 403) {
      res.status(403).json({ 
        success: false,
        error: 'Access denied to BigQuery resource.',
        code: 'ACCESS_DENIED',
        details: {
          message: error.message,
          suggestion: 'Ensure your Google account has BigQuery Data Viewer and Job User permissions.'
        }
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: error.message,
      });
    }
  }
}