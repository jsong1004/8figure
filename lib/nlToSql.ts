const SYSTEM_PROMPT = `You are a SQL expert for BigQuery. Convert natural language queries to BigQuery SQL.

The table structure is: ai-biz-6b7ec.n8n.ads_spend

ACTUAL TABLE COLUMNS (use these exact names):
- date (DATE)
- platform (STRING) - e.g., 'Google Ads', 'Facebook', 'LinkedIn'
- account (STRING)
- campaign (STRING)
- country (STRING)  
- device (STRING)
- spend (BIGNUMERIC)
- clicks (INTEGER)
- impressions (INTEGER)
- conversions (INTEGER)

IMPORTANT: This table does NOT have a 'revenue' column. Do not use or reference 'revenue' in any queries.

Available metrics to calculate:
- CAC (Customer Acquisition Cost) = spend / conversions
- CPC (Cost Per Click) = spend / clicks
- CTR (Click Through Rate) = clicks / impressions * 100
- CVR (Conversion Rate) = conversions / clicks * 100

DO NOT calculate ROAS since there is no revenue column. If asked about ROAS, explain that revenue data is not available.

For date comparisons:
- "last 30 days" = DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) to CURRENT_DATE()
- "prior 30 days" = DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) to DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)

Return ONLY the SQL query, no explanations. Use proper BigQuery syntax with backticks for the table name.`;

export async function convertNLToSQL(naturalLanguageQuery: string): Promise<string> {
  console.log('Converting NL to SQL:', naturalLanguageQuery);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'BigQuery Analytics',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: naturalLanguageQuery },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content.trim();
    return normalizeSqlOutput(raw);
  } catch (error) {
    console.error('OpenRouter API error:', error);
    console.log('Falling back to hardcoded SQL patterns');
    return generateFallbackSQL(naturalLanguageQuery);
  }
}

function generateFallbackSQL(query: string): string {
  const lowerQuery = query.toLowerCase();
  const tableName = `\`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\``;
  
  console.log('Fallback SQL generation for query:', query);
  console.log('Table name:', tableName);
  
  if ((lowerQuery.includes('cac') || lowerQuery.includes('compare')) && (lowerQuery.includes('last 30 days') || lowerQuery.includes('prior 30 days'))) {
    if (lowerQuery.includes('last 30 days') && lowerQuery.includes('prior 30 days')) {
      return `
        WITH current_period AS (
          SELECT 
            'Last 30 Days' as period,
            SUM(spend) as total_spend,
            SUM(conversions) as total_conversions,
            SUM(clicks) as total_clicks,
            SUM(impressions) as total_impressions
          FROM ${tableName}
          WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE()
        ),
        previous_period AS (
          SELECT 
            'Prior 30 Days' as period,
            SUM(spend) as total_spend,
            SUM(conversions) as total_conversions,
            SUM(clicks) as total_clicks,
            SUM(impressions) as total_impressions
          FROM ${tableName}
          WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 31 DAY)
        )
        SELECT 
          period,
          ROUND(total_spend / NULLIF(total_conversions, 0), 2) as CAC,
          ROUND(total_spend / NULLIF(total_clicks, 0), 2) as CPC,
          ROUND(total_clicks / NULLIF(total_impressions, 0) * 100, 2) as CTR,
          ROUND(total_conversions / NULLIF(total_clicks, 0) * 100, 2) as CVR,
          total_spend,
          total_conversions,
          total_clicks,
          total_impressions
        FROM (
          SELECT * FROM current_period
          UNION ALL
          SELECT * FROM previous_period
        )
        ORDER BY period DESC
      `;
    }
  }
  
  if (lowerQuery.includes('spend') && lowerQuery.includes('platform')) {
    console.log('Using spend by platform SQL pattern');
    return `
      SELECT 
        platform,
        SUM(spend) as total_spend,
        COUNT(DISTINCT date) as days_active
      FROM ${tableName}
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY platform
      ORDER BY total_spend DESC
    `;
  }
  
  if (lowerQuery.includes('top') && lowerQuery.includes('campaign')) {
    console.log('Using top campaigns SQL pattern');
    return `
      SELECT 
        campaign,
        ROUND(SUM(spend) / NULLIF(SUM(conversions), 0), 2) as CAC,
        SUM(spend) as total_spend,
        SUM(conversions) as total_conversions,
        SUM(clicks) as total_clicks
      FROM ${tableName}
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      GROUP BY campaign
      ORDER BY total_spend DESC
      LIMIT 5
    `;
  }
  
  // Default fallback
  console.log('Using default fallback SQL');
  return `SELECT * FROM ${tableName} LIMIT 100`;
}

function normalizeSqlOutput(content: string): string {
  let sql = content.trim();

  // Remove code fences if present
  if (sql.startsWith('```')) {
    // Strip starting fence
    sql = sql.replace(/^```\w*\n?/, '');
    // Strip ending fence
    sql = sql.replace(/\n?```\s*$/, '');
  }

  // Sometimes models wrap SQL in quotes; strip leading/trailing quotes/backticks if they wrap the whole output
  if ((sql.startsWith('"') && sql.endsWith('"')) || (sql.startsWith('\'') && sql.endsWith('\''))) {
    sql = sql.slice(1, -1);
  }

  sql = sql.trim();

  // Fix common table identifier issues: ensure backticks are balanced for fully qualified table
  // e.g., `ai-biz-6b7ec.n8n.ads_spend` might be truncated; attempt to close an unclosed backtick
  const backtickCount = (sql.match(/`/g) || []).length;
  if (backtickCount % 2 === 1) {
    sql += '`';
  }

  return sql.trim();
}