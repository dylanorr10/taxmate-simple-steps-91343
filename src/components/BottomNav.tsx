import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { availableNavItems, getDefaultNavItems } from '@/data/navigationConfig';

const BottomNav = () => {
  const location = useLocation();
  const { profile } = useProfile();

  // Get user's custom nav items or smart defaults
  const userNavItemIds = profile?.nav_items || 
    getDefaultNavItems(profile?.business_type || undefined, profile?.experience_level || undefined);
  
  // Map to actual nav item configs
  const navItems = userNavItemIds
    .map(id => availableNavItems.find(item => item.id === id))
    .filter(Boolean)
    .slice(0, 4); // Enforce max 4 items

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = Icons[item!.icon as keyof typeof Icons] as React.ComponentType<any>;
          const isActive = location.pathname === item!.path;
          
          return (
            <Link
              key={item!.path}
              to={item!.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative tap-feedback ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse-subtle" />
                )}
              </div>
              <span className={`text-xs mt-1.5 ${isActive ? "font-bold" : "font-medium"}`}>
                {item!.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
