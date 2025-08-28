import { ReactNode } from 'react';
import Head from 'next/head';
import AuthButton from './AuthButton';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'BigQuery Ads Analytics' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Natural language BigQuery analytics for advertising data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-800">
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-3xl font-bold text-white flex items-center justify-center space-x-3">
                  <span>📊</span>
                  <span>BigQuery Ads Analytics</span>
                </h1>
                <p className="text-primary-100 mt-2">
                  Ask questions about your advertising data in natural language
                </p>
              </div>
              <div className="absolute right-4">
                <AuthButton />
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        <footer className="text-center text-primary-200 text-sm py-8">
          <p>Powered by Claude 3.5 Sonnet via OpenRouter • Built with Next.js and React</p>
        </footer>
      </div>
    </>
  );
}