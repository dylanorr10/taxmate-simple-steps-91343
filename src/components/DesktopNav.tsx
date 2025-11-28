import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { availableNavItems, getDefaultNavItems } from '@/data/navigationConfig';
import { cn } from '@/lib/utils';

const DesktopNav = () => {
  const location = useLocation();
  const { profile } = useProfile();

  // Get user's custom nav items or smart defaults
  const userNavItemIds = profile?.nav_items || 
    getDefaultNavItems(profile?.business_type || undefined, profile?.experience_level || undefined);
  
  // Map to actual nav item configs - show all available items on desktop
  const navItems = availableNavItems;

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border z-50 shadow-sm">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between px-8 h-16">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Reelin" className="w-10 h-10 rounded-full" />
          <span className="font-bold text-lg text-foreground">Reelin</span>
        </Link>
        
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Link 
          to="/settings" 
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            location.pathname === '/settings'
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Icons.Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </nav>
  );
};

export default DesktopNav;
