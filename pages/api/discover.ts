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
  let session;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch (error: any) {
    return res.status(401).json({ error: 'Authentication error' });
  }
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const bigquery = await getBigQueryClientWithToken(session.accessToken as string);
    const [datasets] = await bigquery.getDatasets();
    
    const discoveredData = [];
    
    for (const dataset of datasets) {
      try {
        const [tables] = await dataset.getTables();
        const tableList = [];
        
        for (const table of tables) {
          try {
            const [metadata] = await table.getMetadata();
            const schema = metadata.schema?.fields?.slice(0, 10).map((field: any) => ({
              name: field.name,
              type: field.type,
              mode: field.mode || 'NULLABLE',
            })) || [];
            
            tableList.push({
              id: table.id,
              fullName: `${dataset.projectId}.${dataset.id}.${table.id}`,
              rows: metadata.numRows || '0',
              created: metadata.creationTime,
              modified: metadata.lastModifiedTime,
              schemaFields: metadata.schema?.fields?.length || 0,
              sampleSchema: schema,
              size: metadata.numBytes ? `${Math.round(parseInt(metadata.numBytes) / 1024 / 1024)} MB` : 'Unknown',
            });
          } catch (tableError) {
            // Skip tables we can't access
            tableList.push({
              id: table.id,
              fullName: `${dataset.projectId}.${dataset.id}.${table.id}`,
              error: 'Access denied',
            });
          }
        }
        
        discoveredData.push({
          project: dataset.projectId,
          dataset: dataset.id,
          location: dataset.location || 'Unknown',
          tables: tableList,
          tableCount: tableList.length,
        });
      } catch (datasetError) {
        // Skip datasets we can't access
        discoveredData.push({
          project: dataset.projectId,
          dataset: dataset.id,
          location: dataset.location || 'Unknown',
          error: 'Cannot access tables',
          tableCount: 0,
        });
      }
    }
    
    // Sort by project and dataset
    discoveredData.sort((a, b) => {
      if (a.project !== b.project) {
        return a.project.localeCompare(b.project);
      }
      return a.dataset.localeCompare(b.dataset);
    });
    
    res.status(200).json({
      success: true,
      totalDatasets: discoveredData.length,
      totalTables: discoveredData.reduce((sum, d) => sum + (d.tableCount || 0), 0),
      data: discoveredData,
    });

  } catch (error: any) {
    console.error('BigQuery discovery error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.code ? `Error code: ${error.code}` : undefined,
    });
  }
}