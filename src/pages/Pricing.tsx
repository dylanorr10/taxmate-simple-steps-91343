import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Crown, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS, TierConfig } from '@/config/subscriptionTiers';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

const tierIcons = {
  starter: Sparkles,
  professional: Crown,
  business: Building2
};

const Pricing = () => {
  const navigate = useNavigate();
  const { tier: currentTier, isLoading: subLoading } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tierConfig: TierConfig) => {
    setLoadingTier(tierConfig.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Please sign in to subscribe');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tierConfig.priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoadingTier(null);
    }
  };

  const tiers = Object.values(SUBSCRIPTION_TIERS);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your freelance journey. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tierIcons[tier.id as keyof typeof tierIcons];
            const isCurrentPlan = currentTier === tier.id;
            const isHighlighted = tier.highlighted;

            return (
              <Card 
                key={tier.id}
                className={cn(
                  "relative flex flex-col transition-all duration-200",
                  isHighlighted && "border-primary shadow-lg scale-[1.02]",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {isHighlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="secondary" className="absolute -top-3 right-4">
                    Current Plan
                  </Badge>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn(
                      "h-5 w-5",
                      isHighlighted ? "text-primary" : "text-muted-foreground"
                    )} />
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">£{tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className="w-full"
                    variant={isHighlighted ? "default" : "outline"}
                    size="lg"
                    disabled={isCurrentPlan || loadingTier !== null || subLoading}
                    onClick={() => handleSubscribe(tier)}
                  >
                    {loadingTier === tier.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ / Trust section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Questions? Check our{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/terms')}>
              Terms of Service
            </Button>
            {' '}and{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/privacy')}>
              Privacy Policy
            </Button>
          </p>
          <p className="text-sm text-muted-foreground">
            All subscriptions can be cancelled anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
