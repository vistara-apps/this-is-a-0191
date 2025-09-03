import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { Camera, CheckCircle, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  photoLimit: string;
  recommended?: boolean;
}

export const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleContinue = async () => {
    if (currentStep === 1 && !selectedPlan) {
      setError('Please select a subscription plan to continue');
      return;
    }
    
    if (currentStep === 3) {
      // Complete onboarding
      setIsLoading(true);
      setError(null);
      
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
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Error completing onboarding:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary">Choose Your Plan</h2>
              <p className="text-text-secondary mt-2">
                Select the subscription plan that best fits your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    selectedPlan === plan.id 
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
                    
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`mt-8 w-full py-2 rounded-md font-medium transition-colors ${
                        selectedPlan === plan.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-primary hover:bg-gray-200'
                      }`}
                    >
                      {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary">Payment Information</h2>
              <p className="text-text-secondary mt-2">
                Enter your payment details to complete your subscription
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
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
                  />
                </div>
              </div>
              
              <div className="mt-6 flex items-center">
                <CreditCard className="w-5 h-5 text-text-secondary mr-2" />
                <span className="text-sm text-text-secondary">
                  Your payment information is securely processed by Stripe.
                </span>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text-primary">Ready to Get Started</h2>
              <p className="text-text-secondary mt-2">
                You're all set up and ready to start using ClaimSnapAI
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Your {pricingPlans.find(plan => plan.id === selectedPlan)?.name} Plan is Active
              </h3>
              
              <p className="text-text-secondary mb-6">
                You can now upload and process up to {pricingPlans.find(plan => plan.id === selectedPlan)?.photoLimit} photos per month.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-text-primary">Upload property damage photos</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-text-primary">AI automatically categorizes and tags them</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-text-primary">Generate compliance-ready reports</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

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
      
      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={`h-2 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex-1 mx-2">
            <div className={`h-2 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex-1">
            <div className={`h-2 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-white/80">
          <div>Choose Plan</div>
          <div>Payment</div>
          <div>Get Started</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-card w-full max-w-4xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          {renderStep()}
          
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-text-primary hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className={`flex items-center px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === 3 ? 'Complete Setup' : 'Continue'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
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

