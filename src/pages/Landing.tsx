import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Link as LinkIcon,
  Smartphone,
  BookOpen,
  UserPlus,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { WaitlistSignup } from "@/components/WaitlistSignup";
import { FeatureCard } from "@/components/FeatureCard";
import { StepCard } from "@/components/StepCard";
import { ProfessionBadge } from "@/components/ProfessionBadge";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Landing = () => {
  const navigate = useNavigate();
  const { data: waitlistCount = 0 } = useWaitlistCount();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignupSuccess = () => {
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Navigation Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-lg shadow-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Reelin Logo" className="h-10 w-10 rounded-lg" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Reelin
              </h1>
            </div>
            <a
              href="https://app.reelin.co.uk/auth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Already have access? Sign in
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold text-foreground">
                Reel in Your Finances{" "}
                <span className="inline-block animate-pulse-subtle">🎣</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The simplest way for self-employed professionals in the UK to manage VAT
                and stay Making Tax Digital compliant
              </p>
            </div>

            {/* Hero Signup Form */}
            <div className="max-w-md mx-auto">
              <WaitlistSignup variant="hero" onSuccess={handleSignupSuccess} />
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>
                Join <span className="font-bold text-primary">{waitlistCount}+</span>{" "}
                professionals getting ready for MTD
              </span>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-xl">🔒</span>
                <span>We respect your privacy</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-xl">📧</span>
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-xl">🇬🇧</span>
                <span>Built for UK sole traders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-4 animate-fade-in">
              <div className="inline-block px-4 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                The Problem
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                VAT compliance shouldn't be this hard
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-destructive text-xl">❌</span>
                  <span className="text-muted-foreground">
                    MTD deadline looming with confusing requirements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive text-xl">❌</span>
                  <span className="text-muted-foreground">
                    Hours wasted on manual transaction tracking
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive text-xl">❌</span>
                  <span className="text-muted-foreground">
                    Expensive accountants for simple VAT returns
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 animate-fade-in">
              <div className="inline-block px-4 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                The Solution
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                Reelin makes it effortless
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">✅</span>
                  <span className="text-muted-foreground">
                    Automatic transaction tracking from your bank accounts
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">✅</span>
                  <span className="text-muted-foreground">
                    MTD-ready submissions directly to HMRC
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-success text-xl">✅</span>
                  <span className="text-muted-foreground">
                    Built specifically for UK self-employed workers
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything you need to stay compliant
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for UK sole traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard
              icon={BarChart3}
              title="MTD Ready"
              description="Stay compliant with Making Tax Digital requirements automatically. No more worrying about deadlines or format requirements."
            />
            <FeatureCard
              icon={LinkIcon}
              title="Direct HMRC Integration"
              description="Submit VAT returns directly to HMRC with one click. Secure authentication and automatic validation included."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Track Tax Savings"
              description="See exactly how much you can save with our smart calculator. Never miss a deductible expense again."
            />
            <FeatureCard
              icon={Smartphone}
              title="Mobile First"
              description="Manage your finances on the go with our mobile-optimized design. Works perfectly on any device."
            />
            <FeatureCard
              icon={LinkIcon}
              title="Bank Integration"
              description="Connect your accounts for automatic transaction tracking. Powered by TrueLayer's secure banking API."
            />
            <FeatureCard
              icon={BookOpen}
              title="Learn as You Go"
              description="Built-in lessons help you understand VAT and taxes. Turn compliance into confidence."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Get started in 3 simple steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From signup to your first VAT return in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <StepCard
              number={1}
              icon={UserPlus}
              title="Sign Up in 2 Minutes"
              description="Create your account and tell us about your business. No complex forms, just the essentials."
            />
            <StepCard
              number={2}
              icon={LinkIcon}
              title="Connect Your Accounts"
              description="Link your bank for automatic transaction tracking. Secure and powered by TrueLayer."
            />
            <StepCard
              number={3}
              icon={CheckCircle}
              title="Submit with Confidence"
              description="Review and submit your VAT returns directly to HMRC. We handle all the technical details."
              isLast
            />
          </div>
        </div>
      </section>

      {/* Built For Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Built by working people, for working people
              </h2>
              <p className="text-xl text-muted-foreground">
                Reelin is designed specifically for UK self-employed professionals
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <ProfessionBadge icon="🔨" label="Trades & Construction" />
              <ProfessionBadge icon="🚗" label="Delivery & Transport" />
              <ProfessionBadge icon="✂️" label="Professional Services" />
              <ProfessionBadge icon="🏪" label="Retail & E-commerce" />
              <ProfessionBadge icon="💼" label="Freelancers & Consultants" />
              <ProfessionBadge icon="🎨" label="Creative & Design" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Counter Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="relative inline-block">
              <div className="text-7xl md:text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-pulse-subtle">
                {waitlistCount}+
              </div>
              <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                Join the community
              </h3>
              <p className="text-xl text-muted-foreground">
                UK sole traders getting ready for Making Tax Digital
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              Ready to reel in your finances?
            </h2>
            <p className="text-xl text-white/90">
              Get early access when we launch in 2025
            </p>
            
            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-2xl">
              <WaitlistSignup variant="cta" onSuccess={handleSignupSuccess} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="Reelin Logo" className="h-8 w-8 rounded-lg" />
                <h3 className="font-bold text-foreground">Reelin</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Helping the self-employed reel-in their finances
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <div className="flex flex-col space-y-2">
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Connect</h4>
              <p className="text-sm text-muted-foreground">
                Questions? Contact us at{" "}
                <a href="mailto:hello@reelin.co.uk" className="text-primary hover:underline">
                  hello@reelin.co.uk
                </a>
              </p>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © 2025 Reelin. Helping the self-employed reel-in their finances.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for UK sole traders
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
