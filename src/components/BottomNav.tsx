import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Car, BookOpen, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBankTransactions } from '@/hooks/useBankTransactions';

const BottomNav = () => {
  const location = useLocation();
  const { pendingTransactions } = useBankTransactions();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/log", label: "Money", icon: FileText },
    { path: "/mileage", label: "Mileage", icon: Car },
    { path: "/learn", label: "Learning", icon: BookOpen },
    { path: "/records", label: "MTD", icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                {item.path === "/log" && pendingTransactions.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                  >
                    {pendingTransactions.length}
                  </Badge>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "font-semibold" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
