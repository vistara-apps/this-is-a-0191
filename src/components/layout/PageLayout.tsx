import React from 'react';
import { Camera, Settings, User, LogOut } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <Camera className="w-8 h-8 text-accent" />
                <h1 className="text-xl font-bold text-white">ClaimSnapAI</h1>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-white/80 hover:text-white transition-colors">Dashboard</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Claims</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Reports</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Analytics</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-white/80 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/80 hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/80 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};