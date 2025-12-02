import { useTheme } from '@/theme';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  const { theme } = useTheme();

  return (
    <div className="loading-screen">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-muted" />
          <div 
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin"
          />
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
