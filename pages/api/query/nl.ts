import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getBigQueryClientWithToken } from '@/lib/bigquery';
import { convertNLToSQL } from '@/lib/nlToSql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  let session;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch (error: any) {
    console.error('Session error:', error);
    if (error.name === 'JWEDecryptionFailed') {
      return res.status(401).json({ 
        error: 'Session expired or invalid. Please sign in again.',
        code: 'SESSION_INVALID'
      });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'NO_SESSION'
    });
  }
  
  if (session.error === 'RefreshAccessTokenError') {
    return res.status(401).json({ 
      error: 'Token expired. Please sign in again.',
      code: 'TOKEN_EXPIRED'
    });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Convert natural language to SQL
    const sqlQuery = await convertNLToSQL(query);
    console.log('Generated SQL Query:', sqlQuery);
    console.log('Original Query:', query);
    
    // Execute the query with user's access token
    const bigquery = await getBigQueryClientWithToken(session.accessToken as string);
    const [rows] = await bigquery.query({
      query: sqlQuery,
      location: process.env.BIGQUERY_LOCATION || 'US',
    });

    res.status(200).json({
      success: true,
      query,
      sql: sqlQuery,
      results: rows,
      rowCount: rows.length,
    });

  } catch (error: any) {
    console.error('Query error:', error);
    
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