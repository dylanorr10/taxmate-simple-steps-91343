import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Home, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  useEffect(() => {
    // Track thank you page view
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        event_category: 'waitlist',
        event_label: 'thank_you_page',
      });
    }
  }, []);

  const handleShare = () => {
    const text = "I just joined the waitlist for Reelin - the easiest way to handle VAT and MTD for UK sole traders! 🎣";
    const url = "https://reelin.co.uk";
    
    if (navigator.share) {
      navigator.share({ title: "Reelin", text, url }).catch(() => {});
    } else {
      // Fallback to Twitter share
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-12 animate-fade-in">
        {/* Success Animation */}
        <div className="relative inline-block">
          <div className="relative z-10">
            <CheckCircle2 className="h-32 w-32 text-success animate-scale-in" />
          </div>
          <div className="absolute inset-0 bg-success/30 rounded-full blur-3xl animate-pulse-subtle" />
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            You're on the list! 🎣
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We'll email you as soon as Reelin launches.
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">What happens next?</h2>
          <ul className="space-y-4 text-left">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">You'll get early access</p>
                <p className="text-sm text-muted-foreground">
                  Be among the first to try Reelin when we launch in 2025
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">We'll keep you updated</p>
                <p className="text-sm text-muted-foreground">
                  Get exclusive updates on our progress and features
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">No spam, we promise</p>
                <p className="text-sm text-muted-foreground">
                  Only important updates about Reelin's launch
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleShare}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto hover-lift"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share with a friend
          </Button>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover hover-lift"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-muted-foreground">
          Questions? Email us at{" "}
          <a href="mailto:hello@reelin.co.uk" className="text-primary hover:underline">
            hello@reelin.co.uk
          </a>
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
