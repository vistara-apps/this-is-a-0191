import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  variant?: 'inline' | 'card';
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onDismiss,
  variant = 'inline'
}) => {
  if (variant === 'card') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-green-800 mb-2">Success</h3>
        <p className="text-green-700 mb-4">{message}</p>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-green-700">{message}</p>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="mt-2 text-sm text-green-700 hover:underline"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

