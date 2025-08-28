import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getBigQueryClientWithToken, getBigQueryClient } from '@/lib/bigquery';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isDemo = process.env.DEMO_MODE === 'true';
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication unless in demo mode
  let session;
  if (!isDemo) {
    session = await getServerSession(req, res, authOptions);
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  try {
    const { sql } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Execute the query
    const bigquery = isDemo
      ? getBigQueryClient()
      : await getBigQueryClientWithToken(session.accessToken as string);
    const [rows] = await bigquery.query({
      query: sql,
      location: process.env.BIGQUERY_LOCATION || 'US',
    });

    res.status(200).json({
      success: true,
      sql,
      results: rows,
      rowCount: rows.length,
    });

  } catch (error: any) {
    console.error('SQL query error:', error);
    
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
        details: error.errors || [],
      });
    }
  }
}