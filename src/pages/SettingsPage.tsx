import { Card } from "@/components/ui/card";
import { Home, FileText, Settings, BookOpen, MessageCircle, HelpCircle, Phone, Palette, LogOut, Building2, CheckCircle2, XCircle, Loader2, Landmark, RefreshCw, Trash2, Navigation, Presentation } from "lucide-react";
import NavigationCustomizer from "@/components/NavigationCustomizer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { useTrueLayerConnection } from "@/hooks/useTrueLayerConnection";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const SettingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, updateProfile, isUpdating } = useProfile();
  const { isConnected, isLoading: hmrcLoading, initiateConnection, refetch } = useHMRCConnection();
  const { 
    connections, 
    isLoading: trueLayerLoading, 
    initiateConnection: connectBank, 
    isInitiating,
    syncTransactions,
    isSyncing,
    disconnectBank,
    isDisconnecting
  } = useTrueLayerConnection();
  
  const [businessName, setBusinessName] = useState("");
  const [vatNumber, setVatNumber] = useState("");

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || "");
      setVatNumber(profile.vat_number || "");
    }
  }, [profile]);

  useEffect(() => {
    // Handle OAuth callback
    const params = new URLSearchParams(location.search);
    if (params.get('hmrc') === 'connected') {
      toast.success("Successfully connected to HMRC!");
      refetch();
      // Clear the query params
      navigate('/settings', { replace: true });
    } else if (params.get('error')) {
      const error = params.get('error');
      toast.error(`Failed to connect to HMRC: ${error}`);
      navigate('/settings', { replace: true });
    } else if (params.get('truelayer_connected') === 'true') {
      toast.success("Bank connected successfully!");
      navigate('/settings', { replace: true });
    } else if (params.get('truelayer_error')) {
      const error = params.get('truelayer_error');
      toast.error(`Failed to connect bank: ${error}`);
      navigate('/settings', { replace: true });
    }
  }, [location.search, navigate, refetch]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      business_name: businessName,
      vat_number: vatNumber,
    });
  };

  const handleToggleDemoMode = async (enabled: boolean) => {
    updateProfile({ demo_mode: enabled });
  };

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/records", label: "Records", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>
        
        {/* Business Profile Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Profile
          </h2>
          <Card className="p-6">
            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Your Business Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    type="text"
                    placeholder="GB123456789"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* HMRC Connection Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            HMRC Connection
          </h2>
          <Card className="p-6">
            {hmrcLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-success" />
                        <div>
                          <p className="font-semibold text-foreground">Connected to HMRC</p>
                          <p className="text-sm text-muted-foreground">
                            Ready for Making Tax Digital submissions
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-foreground">Not Connected</p>
                          <p className="text-sm text-muted-foreground">
                            Connect to HMRC for Making Tax Digital
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {!isConnected && (
                  <Button onClick={initiateConnection} className="w-full">
                    Connect to HMRC
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Bank Connections Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Bank Connections
          </h2>
          <Card className="p-6">
            {trueLayerLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {connections.length === 0 ? (
                  <div className="text-center py-6">
                    <Landmark className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-semibold text-foreground mb-1">No banks connected</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your bank to automatically import transactions
                    </p>
                    <Button onClick={() => connectBank()} disabled={isInitiating}>
                      {isInitiating ? "Connecting..." : "Connect Bank Account"}
                    </Button>
                  </div>
                ) : (
                  <>
                    {connections.map((connection) => (
                      <div key={connection.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Landmark className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{connection.account_name}</p>
                              <p className="text-sm text-muted-foreground">{connection.provider}</p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        {connection.last_sync_at && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Last synced: {format(new Date(connection.last_sync_at), 'PPp')}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncTransactions(connection.id)}
                            disabled={isSyncing}
                            className="flex-1"
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? "Syncing..." : "Sync Now"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => disconnectBank(connection.id)}
                            disabled={isDisconnecting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => connectBank()} disabled={isInitiating} variant="outline" className="w-full">
                      {isInitiating ? "Connecting..." : "Connect Another Bank"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Navigation Preferences */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Navigation Preferences
          </h2>
          <Card className="p-6">
            <NavigationCustomizer />
          </Card>
        </div>

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

        {/* Demo Mode Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Presentation className="w-5 h-5" />
            Investor Demo Mode
          </h2>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Demo Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Show mock connections and data for demonstrations. Perfect for investor presentations and previewing features.
                </p>
              </div>
              <Switch
                checked={profile?.demo_mode || false}
                onCheckedChange={handleToggleDemoMode}
                disabled={isUpdating}
              />
            </div>
            {profile?.demo_mode && (
              <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  ✨ Demo mode is active. HMRC and bank connections will appear connected with sample data.
                </p>
              </div>
            )}
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
          <Card className="p-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Account settings coming soon! This is where you'll manage your business details and preferences.
              </p>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
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
