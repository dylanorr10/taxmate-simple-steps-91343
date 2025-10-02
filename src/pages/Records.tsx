import { Card } from "@/components/ui/card";
import { Home, FileText, BookOpen, Shield, Lock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Records = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/log", label: "Log", icon: FileText },
    { path: "/learn", label: "Learn", icon: BookOpen },
    { path: "/records", label: "MTD", icon: Shield },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
          <div className="w-28 h-28 gradient-primary rounded-full flex items-center justify-center mb-6 shadow-primary animate-pulse">
            <Shield className="w-14 h-14 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-3 gradient-primary bg-clip-text text-transparent">
            Making Tax Digital
          </h1>
          
          <div className="max-w-md space-y-4">
            <p className="text-xl font-semibold text-accent">
              Coming Soon
            </p>
            
            <Card className="p-6 shadow-accent gradient-accent text-white border-0">
              <div className="flex items-start gap-3 text-left">
                <Lock className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-white/95 leading-relaxed">
                    We're building MTD compliance features to help you submit your tax information directly to HMRC.
                  </p>
                </div>
              </div>
            </Card>

            <p className="text-sm text-muted-foreground pt-4">
              We'll notify you when this feature is ready. In the meantime, keep logging your income and expenses!
            </p>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Records;
