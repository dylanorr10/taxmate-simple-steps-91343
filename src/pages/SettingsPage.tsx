import { Card } from "@/components/ui/card";
import { Home, FileText, Settings, BookOpen, MessageCircle, HelpCircle, Phone, Palette } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const SettingsPage = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/records", label: "Records", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>
        
        {/* Appearance Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </h2>
          <Card className="p-6">
            <ThemeSwitcher />
          </Card>
        </div>

        {/* Learning & Help Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning & Help
          </h2>
          <div className="space-y-3">
            <Link to="/learning">
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Tax Made Simple</h3>
                      <p className="text-sm text-muted-foreground">
                        Bite-sized lessons & videos
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">
                    2 completed
                  </span>
                </div>
              </Card>
            </Link>

            <Link to="/glossary">
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Tax Dictionary</h3>
                    <p className="text-sm text-muted-foreground">
                      Plain English explanations
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Card className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Community Q&A</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask other sole traders
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Emergency Help */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Need Help Right Now?
          </h2>
          <div className="space-y-3">
            <Card className="p-4 bg-warning/10 border-warning/20">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-6 h-6 text-warning" />
                <h3 className="font-semibold text-foreground">I'm Stuck!</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Don't worry - we're here to help. Tell us what you're confused about.
              </p>
              <Button variant="outline" className="w-full">
                Get Help Now
              </Button>
            </Card>

            <Card className="p-4 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-foreground">Talk to a Human</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Sometimes it's easier to just talk. Our team speaks plain English.
              </p>
              <Button variant="outline" className="w-full">
                Request a Call
              </Button>
            </Card>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Account</h2>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Account settings coming soon! This is where you'll manage your business details and preferences.
            </p>
          </Card>
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

export default SettingsPage;
