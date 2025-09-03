import React, { useState } from 'react';
import { SignIn } from '../components/auth/SignIn';
import { SignUp } from '../components/auth/SignUp';
import { PasswordReset } from '../components/auth/PasswordReset';
import { Camera } from 'lucide-react';

type AuthView = 'signin' | 'signup' | 'reset';

export const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('signin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Camera className="w-10 h-10 text-accent mr-3" />
            <h1 className="text-3xl font-bold text-white">ClaimSnapAI</h1>
          </div>
        </div>
      </div>
      
      {/* Auth Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-card w-full max-w-md p-8">
          {view === 'signin' && (
            <SignIn 
              onSignUpClick={() => setView('signup')}
              onForgotPasswordClick={() => setView('reset')}
            />
          )}
          
          {view === 'signup' && (
            <SignUp 
              onSignInClick={() => setView('signin')}
            />
          )}
          
          {view === 'reset' && (
            <PasswordReset 
              onBackToSignInClick={() => setView('signin')}
            />
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white/60 text-sm">
            <p>© {new Date().getFullYear()} ClaimSnapAI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

