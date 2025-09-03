import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';

type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

interface UseSubscriptionResult {
  currentPlan: SubscriptionPlan | null;
  isUpdating: boolean;
  error: Error | null;
  updateSubscription: (plan: SubscriptionPlan) => Promise<boolean>;
  checkUsageLimit: (photoCount: number) => boolean;
  getPhotoLimit: () => number;
}

export const useSubscription = (): UseSubscriptionResult => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSubscription = useCallback(async (plan: SubscriptionPlan): Promise<boolean> => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return false;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // In a real implementation, this would integrate with Stripe
      // For now, we'll just update the user's subscription plan in Supabase
      const { user: updatedUser, error: updateError } = await supabaseService.updateUserProfile(
        user.id,
        { subscriptionPlan: plan }
      );

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError(error instanceof Error ? error : new Error('Unknown error updating subscription'));
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [user]);

  const getPhotoLimit = useCallback((): number => {
    if (!user) return 0;

    switch (user.subscriptionPlan) {
      case 'basic':
        return 1000;
      case 'pro':
        return 3000;
      case 'enterprise':
        return Infinity;
      default:
        return 0;
    }
  }, [user]);

  const checkUsageLimit = useCallback((photoCount: number): boolean => {
    if (!user) return false;
    
    const limit = getPhotoLimit();
    return photoCount <= limit;
  }, [user, getPhotoLimit]);

  return {
    currentPlan: user?.subscriptionPlan || null,
    isUpdating,
    error,
    updateSubscription,
    checkUsageLimit,
    getPhotoLimit
  };
};

export default useSubscription;

