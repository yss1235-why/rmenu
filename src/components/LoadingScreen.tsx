import { UtensilsCrossed } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = "Loading menu..." }: LoadingScreenProps) => {
  return (
    <div className="loading-screen">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo with spinner */}
        <div className="loading-spinner w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <UtensilsCrossed className="w-8 h-8 text-primary" />
        </div>
        
        {/* Loading message */}
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
