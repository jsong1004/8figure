import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';

const errors = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'Unable to sign in.',
};

export default function Error() {
  const { query } = useRouter();
  const error = query.error as keyof typeof errors;

  return (
    <Layout title="Authentication Error">
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Authentication Error
            </h1>
            
            <p className="text-gray-600 mb-4">
              {error ? errors[error] ?? errors.Default : errors.Default}
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/signin" className="btn w-full inline-block">
              Try Again
            </Link>
            
            <Link href="/auth/reset" className="btn-secondary w-full inline-block">
              Reset Session
            </Link>
            
            <Link href="/" className="btn-secondary w-full inline-block">
              Go Home
            </Link>
          </div>

          {error === 'AccessDenied' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Access Denied:</strong> Make sure your Google account has access to the BigQuery project and datasets you're trying to query.
              </p>
            </div>
          )}

          {error === 'Configuration' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Configuration Error:</strong> Please contact the administrator. The OAuth configuration may need to be updated.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}