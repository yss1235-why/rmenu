import { UtensilsCrossed } from 'lucide-react';
import { useTheme } from '@/theme';

interface SplashScreenProps {
  restaurantName?: string;
}

export const SplashScreen = ({ restaurantName }: SplashScreenProps) => {
  const { theme } = useTheme();
  const name = restaurantName || theme.restaurant.name;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: `hsl(${theme.splash.backgroundColor})` }}
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        <div 
          className="splash-logo w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ backgroundColor: `hsl(${theme.splash.textColor} / 0.2)` }}
        >
          {theme.restaurant.logo ? (
            <img 
              src={theme.restaurant.logo} 
              alt={name}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <UtensilsCrossed 
              className="w-14 h-14" 
              style={{ color: `hsl(${theme.splash.textColor})` }}
            />
          )}
        </div>

        {/* Restaurant Name */}
        <div className="splash-text text-center">
          <h1 
            className="font-serif text-4xl font-bold tracking-wide"
            style={{ color: `hsl(${theme.splash.textColor})` }}
          >
            {name}
          </h1>
          <p 
            className="text-sm mt-2 font-medium"
            style={{ color: `hsl(${theme.splash.textColor} / 0.7)` }}
          >
            {theme.restaurant.tagline || 'Digital Menu'}
          </p>
        </div>
      </div>
    </div>
  );
};
