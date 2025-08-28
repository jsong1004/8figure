import { useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function ResetAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Clear all NextAuth cookies
    const clearCookies = () => {
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('next-auth') || name.startsWith('__Secure-next-auth')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; secure; samesite=lax`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=lax`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });
    };

    clearCookies();
    
    // Force sign out if user is signed in
    if (session) {
      signOut({ redirect: false });
    }

    // Redirect to sign in after clearing
    setTimeout(() => {
      router.push('/auth/signin');
    }, 2000);
  }, [session, router]);

  return (
    <Layout title="Resetting Authentication">
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Resetting Authentication
            </h1>
            
            <p className="text-gray-600 mb-4">
              Clearing cookies and session data...
            </p>
            
            <div className="text-sm text-gray-500">
              You'll be redirected to sign in shortly.
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">What's happening?</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Clearing NextAuth cookies</li>
              <li>• Resetting session tokens</li>
              <li>• Signing out current session</li>
              <li>• Preparing fresh authentication</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}