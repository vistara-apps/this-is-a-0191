import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { User } from '../types';
import { 
  Save, 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  User as UserIcon, 
  Bell, 
  Shield, 
  LogOut 
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'notifications' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile form state
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Update user profile in Supabase
      const { user: updatedUser, error: updateError } = await supabaseService.updateUserProfile(
        user.id,
        { email } as Partial<User>
      );
      
      if (updateError) throw updateError;
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Please fill in all password fields');
      }
      
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // This would be implemented with Supabase Auth
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Profile Settings</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-text-primary mb-1">
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center px-4 py-2 rounded-md font-medium text-white transition-all ${
                  isLoading
                    ? 'bg-primary/70 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        );
        
      case 'subscription':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Subscription Settings</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-text-primary">Current Plan</h3>
                  <p className="text-text-secondary mt-1">
                    {user?.subscriptionPlan === 'basic' ? 'Basic Plan' : 
                     user?.subscriptionPlan === 'pro' ? 'Professional Plan' : 
                     'Enterprise Plan'}
                  </p>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-text-primary">Plan Features:</h4>
                    <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                      {user?.subscriptionPlan === 'basic' && (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Up to 1,000 photos per month
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Basic AI photo categorization
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Standard report generation
                          </li>
                        </>
                      )}
                      
                      {user?.subscriptionPlan === 'pro' && (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Up to 3,000 photos per month
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Advanced AI photo categorization
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Premium report templates
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Priority processing
                          </li>
                        </>
                      )}
                      
                      {user?.subscriptionPlan === 'enterprise' && (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Unlimited photos
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Enterprise-grade AI categorization
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Custom report templates
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Dedicated support
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            API access
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-2xl font-bold text-text-primary">
                    {user?.subscriptionPlan === 'basic' ? '$49' : 
                     user?.subscriptionPlan === 'pro' ? '$99' : 
                     'Custom'}
                  </span>
                  <span className="text-text-secondary">/month</span>
                  
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-text-primary mb-4">Payment Method</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 text-text-secondary mr-3" />
                  <div>
                    <p className="font-medium text-text-primary">Visa ending in 4242</p>
                    <p className="text-sm text-text-secondary">Expires 12/2025</p>
                  </div>
                </div>
                
                <button className="text-primary hover:underline">
                  Update
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-medium text-text-primary mb-4">Billing History</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Description</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-text-primary">Aug 1, 2023</td>
                      <td className="px-4 py-3 text-sm text-text-primary">Monthly Subscription</td>
                      <td className="px-4 py-3 text-sm text-text-primary">$49.00</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Paid
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <a href="#" className="text-primary hover:underline">
                          Download
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-text-primary">Jul 1, 2023</td>
                      <td className="px-4 py-3 text-sm text-text-primary">Monthly Subscription</td>
                      <td className="px-4 py-3 text-sm text-text-primary">$49.00</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Paid
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <a href="#" className="text-primary hover:underline">
                          Download
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-text-primary">Email Notifications</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Receive email notifications for important updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-text-primary">Processing Notifications</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Get notified when your photo batches are processed
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-text-primary">Report Notifications</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Get notified when reports are generated
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="font-medium text-text-primary">Marketing Emails</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Receive updates about new features and promotions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        );
        
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Security Settings</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary mb-1">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center px-4 py-2 rounded-md font-medium text-white transition-all ${
                  isLoading
                    ? 'bg-primary/70 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
            
            <div className="border-t border-gray-200 pt-6 mt-8">
              <h3 className="font-medium text-text-primary mb-4">Sign Out</h3>
              <p className="text-text-secondary mb-4">
                Sign out of your account on this device
              </p>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-text-primary mb-4">Delete Account</h3>
              <p className="text-text-secondary mb-4">
                Permanently delete your account and all associated data
              </p>
              <button
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/80 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Content */}
      <div className="bg-surface rounded-lg shadow-card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-200">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white'
                    : 'text-text-primary hover:bg-gray-100'
                }`}
              >
                <UserIcon className="w-5 h-5 mr-3" />
                Profile
              </button>
              
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'subscription'
                    ? 'bg-primary text-white'
                    : 'text-text-primary hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-3" />
                Subscription
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary text-white'
                    : 'text-text-primary hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5 mr-3" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary text-white'
                    : 'text-text-primary hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5 mr-3" />
                Security
              </button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-green-700">{success}</span>
              </div>
            )}
            
            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

