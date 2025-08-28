import { BigQuery } from '@google-cloud/bigquery';
import { GoogleAuth } from 'google-auth-library';

let bigqueryClient: BigQuery | null = null;

export function getBigQueryClient() {
  if (!bigqueryClient) {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/bigquery'],
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        type: 'authorized_user',
      },
    });

    bigqueryClient = new BigQuery({
      projectId: process.env.PROJECT_ID,
      auth,
    });
  }
  return bigqueryClient;
}

export async function getBigQueryClientWithToken(accessToken: string) {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/bigquery'],
  });
  
  // Set the access token
  const authClient = await auth.getClient();
  authClient.credentials = { access_token: accessToken };
  
  return new BigQuery({
    projectId: process.env.PROJECT_ID,
    auth: authClient,
  });
}

export async function runQuery(query: string) {
  const bigquery = getBigQueryClient();
  const [rows] = await bigquery.query({
    query,
    location: process.env.BIGQUERY_LOCATION || 'US',
  });
  return rows;
}

export async function getTableSchema() {
  const bigquery = getBigQueryClient();
  const dataset = bigquery.dataset(process.env.DATASET_ID!);
  const table = dataset.table(process.env.TABLE_ID!);
  const [metadata] = await table.getMetadata();
  
  return metadata.schema.fields.map((field: any) => ({
    name: field.name,
    type: field.type,
    mode: field.mode || 'NULLABLE',
    description: field.description || '',
  }));
}