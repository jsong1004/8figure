import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
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
    // Get table schema with user's access token
    const bigquery = await getBigQueryClientWithToken(session.accessToken as string);
    const dataset = bigquery.dataset(process.env.DATASET_ID!);
    const table = dataset.table(process.env.TABLE_ID!);
    const [metadata] = await table.getMetadata();
    
    const schema = metadata.schema.fields.map((field: any) => ({
      name: field.name,
      type: field.type,
      mode: field.mode || 'NULLABLE',
      description: field.description || '',
    }));

    res.status(200).json({
      success: true,
      table: `${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}`,
      schema,
    });

  } catch (error: any) {
    console.error('Schema fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
    });
  }
}