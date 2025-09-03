import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { CheckCircle, AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  photoLimit: string;
  recommended?: boolean;
}

export const Subscription: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$49',
      description: 'Perfect for individual adjusters with moderate claim volume',
      features: [
        'Up to 1,000 photos per month',
        'Basic AI photo categorization',
        'Standard report generation',
        'Email support'
      ],
      photoLimit: '1,000'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$99',
      description: 'Ideal for busy adjusters with higher claim volume',
      features: [
        'Up to 3,000 photos per month',
        'Advanced AI photo categorization',
        'Premium report templates',
        'Priority processing',
        'Priority support'
      ],
      photoLimit: '3,000',
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For agencies and teams with high-volume needs',
      features: [
        'Unlimited photos',
        'Enterprise-grade AI categorization',
        'Custom report templates',
        'Dedicated support',
        'API access',
        'Team management'
      ],
      photoLimit: 'Unlimited'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentForm(true);
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Update user profile with selected plan
      const { user: updatedUser, error: updateError } = await supabaseService.updateUserProfile(
        user.id,
        { 
          subscriptionPlan: selectedPlan as 'basic' | 'pro' | 'enterprise'
        }
      );
      
      if (updateError) throw updateError;
      
      setSuccess(`Successfully upgraded to the ${pricingPlans.find(plan => plan.id === selectedPlan)?.name} plan!`);
      setShowPaymentForm(false);
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Subscription Plans</h1>
        <p className="text-white/80 mt-2">
          Choose the plan that best fits your needs
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-surface rounded-lg shadow-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Current Plan</h2>
            <p className="text-text-secondary mt-1">
              You are currently on the {user?.subscriptionPlan === 'basic' ? 'Basic' : 
                                        user?.subscriptionPlan === 'pro' ? 'Professional' : 
                                        'Enterprise'} plan
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <span className="text-2xl font-bold text-text-primary">
              {user?.subscriptionPlan === 'basic' ? '$49' : 
               user?.subscriptionPlan === 'pro' ? '$99' : 
               'Custom'}
            </span>
            <span className="text-text-secondary">/month</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm ? (
        <div className="bg-surface rounded-lg shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Payment Information</h2>
            <button 
              onClick={() => setShowPaymentForm(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              Back to Plans
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-text-primary">Selected Plan</h3>
                <p className="text-text-secondary mt-1">
                  {pricingPlans.find(plan => plan.id === selectedPlan)?.name} Plan
                </p>
              </div>
              <div>
                <span className="text-2xl font-bold text-text-primary">
                  {pricingPlans.find(plan => plan.id === selectedPlan)?.price}
                </span>
                {selectedPlan !== 'enterprise' && <span className="text-text-secondary">/month</span>}
              </div>
            </div>
            
            <div className="space-y-2">
              {pricingPlans.find(plan => plan.id === selectedPlan)?.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-text-primary">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleUpdateSubscription} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-text-primary mb-1">
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-text-primary mb-1">
                    Expiry Date
                  </label>
                  <input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-text-primary mb-1">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="nameOnCard" className="block text-sm font-medium text-text-primary mb-1">
                  Name on Card
                </label>
                <input
                  id="nameOnCard"
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-text-secondary mr-2" />
              <span className="text-sm text-text-secondary">
                Your payment information is securely processed by Stripe.
              </span>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center w-full px-6 py-3 bg-primary text-white rounded-md font-medium transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Upgrade Subscription
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Pricing Plans */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-surface border rounded-lg overflow-hidden transition-all ${
                user?.subscriptionPlan === plan.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-gray-200 hover:border-primary/50'
              } ${plan.recommended ? 'relative' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1">
                  RECOMMENDED
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                  {plan.id !== 'enterprise' && <span className="text-text-secondary">/month</span>}
                </div>
                <p className="mt-2 text-text-secondary">{plan.description}</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-text-primary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {user?.subscriptionPlan === plan.id ? (
                  <div className="mt-8 py-2 text-center bg-primary/10 text-primary rounded-md font-medium">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="mt-8 w-full py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

