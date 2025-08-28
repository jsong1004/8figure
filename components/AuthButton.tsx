import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span className="text-white text-sm">Loading...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-white">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-8 h-8 rounded-full border-2 border-white/20"
            />
          )}
          <div className="text-sm">
            <div className="font-medium">{session.user?.name}</div>
            <div className="text-primary-100 text-xs">{session.user?.email}</div>
          </div>
        </div>
        
        <button
          onClick={() => signOut()}
          className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 
                     text-white rounded-lg transition-colors duration-200
                     border border-white/20 hover:border-white/30"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 bg-white/10 hover:bg-white/20 
                 text-white rounded-lg transition-colors duration-200
                 border border-white/20 hover:border-white/30"
    >
      Sign In
    </button>
  );
}