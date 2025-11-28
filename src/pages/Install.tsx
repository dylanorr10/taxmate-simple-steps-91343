import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, CheckCircle, Share, MoreVertical } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Listen for the install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 lg:pb-8">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Install Reelin</h1>
          <p className="text-muted-foreground">
            Add Reelin to your home screen for quick access
          </p>
        </div>

        {isInstalled ? (
          <Card className="p-6 text-center bg-success/5 border-success/20">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Already Installed!</h2>
            <p className="text-sm text-muted-foreground">
              Reelin is already on your home screen. Enjoy!
            </p>
          </Card>
        ) : (
          <>
            {/* Android/Chrome - Direct Install */}
            {deferredPrompt && (
              <Card className="p-6 mb-4">
                <h2 className="font-semibold text-foreground mb-3">Install Now</h2>
                <Button onClick={handleInstall} className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Add to Home Screen
                </Button>
              </Card>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <Card className="p-6 mb-4">
                <h2 className="font-semibold text-foreground mb-4">Install on iPhone/iPad</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Tap the <Share className="w-4 h-4 inline mx-1" /> Share button in Safari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Scroll down and tap "Add to Home Screen"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Tap "Add" in the top right corner
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Android Chrome Instructions (fallback) */}
            {isAndroid && !deferredPrompt && (
              <Card className="p-6 mb-4">
                <h2 className="font-semibold text-foreground mb-4">Install on Android</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Tap the <MoreVertical className="w-4 h-4 inline mx-1" /> menu in Chrome
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Tap "Add to Home screen" or "Install app"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Confirm by tapping "Add"
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Benefits */}
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-4">Why Install?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Launch instantly from your home screen
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Works offline for viewing your data
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Full-screen experience without browser UI
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Faster loading and better performance
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Install;
