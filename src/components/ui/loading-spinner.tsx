import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 16,
  className = ''
}: LoadingSpinnerProps) => (
  <Loader2 
    className={`w-${size} h-${size} animate-spin ${className}`} 
    aria-hidden="true"
  />
);
