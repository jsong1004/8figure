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
    console.error('Session error:', error);
    return res.status(401).json({ error: 'Authentication error' });
  }
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const bigquery = await getBigQueryClientWithToken(session.accessToken as string);
    
    // Check if we can access BigQuery at all
    const [datasets] = await bigquery.getDatasets();
    
    // Check for the specific project and dataset
    const projectId = process.env.PROJECT_ID;
    const datasetId = process.env.DATASET_ID;
    const tableId = process.env.TABLE_ID;
    
    let targetDataset = null;
    let targetTable = null;
    let accessibleDatasets = [];
    
    // List accessible datasets
    for (const dataset of datasets) {
      accessibleDatasets.push({
        id: dataset.id,
        projectId: dataset.projectId,
        location: dataset.location,
      });
      
      if (dataset.id === datasetId && dataset.projectId === projectId) {
        targetDataset = dataset;
      }
    }
    
    // If we found the target dataset, check for the table
    if (targetDataset) {
      try {
        const [tables] = await targetDataset.getTables();
        const tableList = tables.map(table => ({
          id: table.id,
          schema: table.metadata?.schema?.fields?.length || 0,
        }));
        
        // Check if our target table exists
        targetTable = tables.find(table => table.id === tableId);
        
        if (targetTable) {
          // Get table metadata
          const [metadata] = await targetTable.getMetadata();
          
          return res.status(200).json({
            success: true,
            status: 'ready',
            message: 'All configurations verified successfully',
            details: {
              project: projectId,
              dataset: datasetId,
              table: tableId,
              tableExists: true,
              tableRows: metadata.numRows,
              tableSchema: metadata.schema?.fields?.length || 0,
              datasetLocation: targetDataset.location,
              configuredLocation: process.env.BIGQUERY_LOCATION || 'US',
              accessibleDatasets: accessibleDatasets.length,
            }
          });
        } else {
          return res.status(404).json({
            success: false,
            status: 'table_not_found',
            message: `Table '${tableId}' not found in dataset '${datasetId}'`,
            details: {
              project: projectId,
              dataset: datasetId,
              table: tableId,
              availableTables: tableList,
              accessibleDatasets: accessibleDatasets.length,
            }
          });
        }
      } catch (tableError: any) {
        return res.status(500).json({
          success: false,
          status: 'table_access_error',
          message: `Cannot access tables in dataset '${datasetId}': ${tableError.message}`,
          details: {
            project: projectId,
            dataset: datasetId,
            table: tableId,
            error: tableError.message,
            accessibleDatasets: accessibleDatasets.length,
          }
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        status: 'dataset_not_found',
        message: `Dataset '${datasetId}' not found in project '${projectId}'`,
        details: {
          project: projectId,
          dataset: datasetId,
          table: tableId,
          accessibleDatasets: accessibleDatasets,
          suggestion: accessibleDatasets.length > 0 
            ? `You have access to ${accessibleDatasets.length} datasets. Check the dataset ID in your configuration.`
            : 'You may not have BigQuery permissions. Contact your administrator.'
        }
      });
    }

  } catch (error: any) {
    console.error('BigQuery verification error:', error);
    
    // Handle specific BigQuery errors
    if (error.code === 403) {
      return res.status(403).json({
        success: false,
        status: 'permission_denied',
        message: 'Access denied to BigQuery. Check your permissions.',
        details: {
          error: error.message,
          suggestion: 'Ensure your Google account has BigQuery Data Viewer and Job User roles.'
        }
      });
    }
    
    if (error.code === 404) {
      return res.status(404).json({
        success: false,
        status: 'resource_not_found',
        message: 'BigQuery resource not found.',
        details: {
          error: error.message,
          suggestion: 'Check your project ID, dataset ID, and table ID in the configuration.'
        }
      });
    }
    
    return res.status(500).json({
      success: false,
      status: 'bigquery_error',
      message: 'Failed to verify BigQuery configuration',
      details: {
        error: error.message,
        code: error.code,
      }
    });
  }
}