# BigQuery Ads Analytics - Next.js & React App

A modern natural language interface for querying BigQuery advertising data. Built with Next.js, React, TypeScript, and Tailwind CSS. Ask questions in plain English and get SQL-powered insights from your ads spend data.

## ✨ Features

- **🧠 Natural Language Queries**: Ask questions like "Compare CAC and metrics for last 30 days vs prior 30 days" (Powered by Claude 3.5 Sonnet)
- **⚡ Direct SQL Execution**: Write and execute BigQuery SQL with syntax highlighting
- **📊 Quick Metrics Dashboard**: Pre-built metrics overview with beautiful visualizations
- **🎨 Modern UI**: Clean, responsive design with Tailwind CSS
- **🚀 Real-time Results**: Instant query execution with loading states and toast notifications
- **📱 Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **🔍 Schema Detection**: Automatic table schema discovery and validation

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Next.js API Routes
- **Database**: Google BigQuery
- **AI**: Claude 3.5 Sonnet via OpenRouter
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Google Cloud Project** with BigQuery enabled
3. **Google OAuth 2.0 credentials** (Client ID & Secret)
4. **OpenRouter API key** (for Claude 3.5 Sonnet)

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Google Cloud Setup

**⚠️ Important**: This app uses OAuth 2.0 for secure, user-based authentication instead of service account keys.

1. **Complete OAuth Setup**: Follow the detailed guide in [`OAUTH_SETUP.md`](./OAUTH_SETUP.md)
2. **Key steps**:
   - Create OAuth 2.0 credentials in Google Cloud Console
   - Configure OAuth consent screen
   - Set up BigQuery permissions for users
   - Get Client ID and Client Secret

### 3. OpenRouter Setup

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. Get your API key from the dashboard
3. The app uses Claude 3.5 Sonnet model for optimal SQL generation

### 4. Environment Configuration

Copy `.env.example` to `.env.local` and update:

```env
# Google Cloud Configuration
PROJECT_ID=ai-biz-6b7ec
DATASET_ID=n8n
TABLE_ID=ads_spend

# BigQuery Location (region of your dataset, e.g., US, EU, us-west1)
BIGQUERY_LOCATION=us-west1

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# OpenRouter Configuration
OPENROUTER_API_KEY=your-openrouter-api-key
APP_URL=http://localhost:3000

# Demo mode (bypass Google login, use server OAuth refresh token)
# WARNING: Only use for local demos, not production.
DEMO_MODE=false
```

### Demo Mode (No Google Login Required)

For local demos or testing, you can bypass Google authentication entirely:

1. **Enable Demo Mode:**
   ```env
   DEMO_MODE=true
   ```

2. **Ensure you have a valid `GOOGLE_REFRESH_TOKEN`** (see "Getting a Google Refresh Token" below)

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

**How it works:**
- Demo mode uses the server's `GOOGLE_REFRESH_TOKEN` for BigQuery access
- No Google login required - the app works immediately
- Perfect for demos, testing, or when you don't want to manage user authentication
- **Security Note:** Only use demo mode for local development. In production, always require user authentication.

### BigQuery Location

- Set `BIGQUERY_LOCATION` to your dataset's region (for example, `us-west1`).
- The app uses this value when executing queries, so region mismatches won't cause errors like "Dataset ... was not found in location US".
- You can verify your dataset's location in the BigQuery console under your dataset's Details tab.

### Getting a Google Refresh Token

This project supports using an OAuth refresh token for server-side BigQuery access (see `lib/bigquery.ts`). There are two easy ways to obtain it:

1) OAuth 2.0 Playground (recommended)
- Add `https://developers.google.com/oauthplayground` to your OAuth client's Authorized redirect URIs in Google Cloud Console.
- Open Google OAuth 2.0 Playground, click the gear icon:
  - Check "Use your own OAuth credentials" and enter your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - Ensure it sends `access_type=offline` and `prompt=consent`.
- Select scope: `https://www.googleapis.com/auth/bigquery` (you may also add `userinfo.email`, `userinfo.profile`).
- Authorize → Exchange authorization code for tokens → Copy the Refresh token into `.env.local` as `GOOGLE_REFRESH_TOKEN`.

2) From this app via NextAuth
- The app already requests offline access with consent.
- Temporarily log the token in `pages/api/auth/[...nextauth].ts` inside the `jwt` callback when `account` is present:
  ```ts
  if (account) {
    console.log('GOOGLE_REFRESH_TOKEN:', account.refresh_token);
  }
  ```
- Sign in once, copy the printed refresh token into `.env.local` as `GOOGLE_REFRESH_TOKEN`, then remove the log.

### Adjusting SQL Output Tokens

If generated SQL is truncated, increase the model output token limit used for NL→SQL:

- File: `lib/nlToSql.ts`
- Look for the `max_tokens` field in the request body to OpenRouter and adjust as needed (default is 500):

```ts
body: JSON.stringify({
  model: 'anthropic/claude-3.5-sonnet',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: naturalLanguageQuery },
  ],
  temperature: 0.1,
  max_tokens: 500,
}),
```

Note: Higher values consume more API credits and may increase latency.

**Generate NextAuth Secret**:
```bash
openssl rand -base64 32
```

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to access the application.

## 📚 API Reference

### Natural Language Query
```typescript
POST /api/query/nl
Content-Type: application/json

{
  "query": "What is the total spend by platform in the last 7 days?"
}
```

### Direct SQL Query
```typescript
POST /api/query/sql
Content-Type: application/json

{
  "sql": "SELECT * FROM `ai-biz-6b7ec.n8n.ads_spend` LIMIT 10"
}
```

### Quick Metrics
```typescript
GET /api/metrics/overview?days=30
```

### Table Schema
```typescript
GET /api/schema
```

### Health Check
```typescript
GET /api/health
```

## 💡 Example Natural Language Queries

The app understands complex questions like:

- **Comparative Analysis**: "Compare CAC and metrics for last 30 days vs prior 30 days"
- **Platform Performance**: "What is the total spend by platform in the last 7 days?"
- **Top Performers**: "Show me the top 5 campaigns by total spend"
- **Efficiency Metrics**: "Calculate the average CPC and CTR for each platform"
- **Trend Analysis**: "What is the conversion rate trend over the last month?"
- **Cost Optimization**: "Which campaigns have the lowest CAC in the last 14 days?"

## 📊 Calculated Metrics

The application automatically calculates key advertising metrics:

| Metric | Formula | Description |
|--------|---------|-------------|
| **CAC** | `spend / conversions` | Customer Acquisition Cost |
| **CPC** | `spend / clicks` | Cost Per Click |
| **CTR** | `clicks / impressions × 100` | Click Through Rate |
| **CVR** | `conversions / clicks × 100` | Conversion Rate |

## 🎨 UI Components

### Core Components
- **`Layout`**: Main application layout with header and footer
- **`TabNavigation`**: Mode switching between NL, SQL, and Metrics
- **`QueryInput`**: Input interface for queries with loading states
- **`ExampleQueries`**: Pre-built example questions
- **`MetricsGrid`**: Visual metrics dashboard
- **`DataTable`**: Results table with formatting
- **`LoadingSpinner`**: Loading states and animations

### Styling
- **Custom Tailwind Components**: Reusable UI components
- **Responsive Design**: Mobile-first approach
- **Design System**: Consistent colors, typography, and spacing
- **Animations**: Smooth transitions and hover effects

## 📂 Project Structure

```
├── components/           # React components
├── lib/                 # Utility functions
│   ├── bigquery.ts     # BigQuery client
│   └── nlToSql.ts      # Natural language to SQL
├── pages/
│   ├── api/            # Next.js API routes
│   ├── _app.tsx        # App configuration
│   └── index.tsx       # Main page
├── styles/
│   └── globals.css     # Global styles
├── types/
│   └── index.ts        # TypeScript types
├── .env.example        # Environment template
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind configuration
└── tsconfig.json       # TypeScript configuration
```

## 🔧 Development

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Tailwind**: Utility-first CSS approach

### Build Commands
```bash
npm run dev       # Start development server
npm run build     # Create production build
npm start         # Start production server
npm run lint      # Run ESLint
```

## 🐛 Troubleshooting

### Authentication Issues
- ✅ Complete OAuth setup following `OAUTH_SETUP.md`
- ✅ Verify Client ID and Client Secret are correct
- ✅ Check authorized redirect URIs in Google Cloud Console
- ✅ Ensure users have BigQuery permissions in IAM
- ✅ Confirm BigQuery API is enabled

### BigQuery Access Issues
- ✅ Add users to BigQuery IAM roles (Data Viewer, Job User)
- ✅ Check project ID, dataset, and table names
- ✅ Verify OAuth consent screen is configured
- ✅ Test with a user who has proper permissions

### OpenRouter/Claude API Issues
- ✅ Verify OpenRouter API key is valid
- ✅ Check rate limits at [OpenRouter.ai](https://openrouter.ai)
- ✅ Confirm sufficient API credits
- ✅ The app includes fallback SQL generation

### Build Issues
- ✅ Ensure Node.js version is 18+
- ✅ Clear `.next` folder and `node_modules`
- ✅ Run `npm install` again
- ✅ Check for TypeScript errors

### Performance Optimization
- 🚀 **Server-Side Rendering**: Pages are pre-rendered
- 🚀 **API Route Optimization**: Efficient BigQuery connections
- 🚀 **Component Optimization**: React.memo for heavy components
- 🚀 **Bundle Optimization**: Tree shaking and code splitting

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub repository
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Configure build settings
- **Railway**: Add environment variables
- **Docker**: Create Dockerfile for containerization

## 🔐 Security Best Practices

- 🛡️ **OAuth 2.0**: Uses secure user authentication instead of service keys
- 🛡️ **No Service Keys**: No JSON key files to manage or secure
- 🛡️ **User-Based Permissions**: Each user's own BigQuery permissions apply
- 🛡️ **Token Refresh**: Automatic token renewal for security
- 🛡️ **Environment Variables**: All secrets stored securely
- 🛡️ **HTTPS Required**: Secure transmission in production
- 🛡️ **Restricted Domains**: OAuth client restricted to authorized domains

## 📝 License

MIT License - feel free to use this project for your own applications.

---

**Built with ❤️ using Next.js, React, and Claude 3.5 Sonnet**