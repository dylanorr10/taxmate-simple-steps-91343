import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Car, 
  Target, 
  Brain, 
  Lightbulb, 
  Clock, 
  Zap,
  AlertTriangle,
  TrendingDown,
  HeartCrack,
  ArrowRight,
  CheckCircle2,
  Flame,
  MapPin,
  Receipt,
  Fuel,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(200,16%,24%)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(200,16%,24%)]/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Reelin" className="h-8 w-8 rounded-full" />
            <span className="text-xl font-bold text-primary">Reelin</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="text-white/80 hover:text-primary hover:bg-white/5"
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/waitlist")}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">🚀</div>
        <div className="absolute top-40 right-20 text-4xl opacity-15 animate-pulse delay-300">💷</div>
        <div className="absolute bottom-10 left-1/4 opacity-10">
          <Brain className="h-24 w-24 text-primary" />
        </div>
        
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: App Preview */}
            <div className="relative order-2 lg:order-1 flex justify-center">
              <div className="bg-white/10 rounded-2xl p-1.5 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 overflow-hidden max-w-[280px]">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full rounded-xl"
                  style={{ imageRendering: 'crisp-edges' }}
                >
                  <source src="/videos/preview.mov" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="absolute -top-2 -right-2 lg:right-16 bg-primary text-primary-foreground rounded-xl px-3 py-2 shadow-lg transform rotate-6">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold">£12k</span>
                  <Receipt className="h-4 w-4" />
                </div>
                <span className="text-[10px]">Tax saved</span>
              </div>
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
                Your first finance hire. For founders who'd rather build than bookkeep.
              </h1>
              
              <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-6 inline-flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">SaaS · AI · Indie · Agency · Creator</span>
              </div>
              
              <p className="text-lg text-white/80 mb-4">
                You're shipping product. You shouldn't be Googling "what's a confirmation statement?" at 11pm.{" "}
                <span className="text-primary font-semibold">Know what to claim. Know what you owe. Stay HMRC-ready.</span>
              </p>

              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <Receipt className="h-4 w-4 text-primary" />
                  Claim your OpenAI bill
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <Target className="h-4 w-4 text-primary" />
                  £90k VAT tracker
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <Zap className="h-4 w-4 text-primary" />
                  Sole trader → Ltd guide
                </span>
              </div>

              <Button 
                size="xl" 
                onClick={() => navigate("/waitlist")}
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary"
              >
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-sm text-white/60 mt-4">
                🎁 Early access + free founder finance checklist
              </p>
              <p className="text-xs text-white/40 mt-2">
                10-lesson Founder Finance 101 · No card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points for Founders */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary font-medium mb-2">Sound Familiar?</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Finance Questions Every Founder Googles at Midnight
          </h2>
          <p className="text-white/70 mb-12">
            You're building. HMRC and Companies House don't care. They expect you to know.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-semibold text-white mb-2">Sole trader or Ltd?</h3>
              <p className="text-white/60 text-sm">
                Get this wrong and you over-pay tax by thousands. Get it right and you save the equivalent of a month's runway. Most founders never learn the rule.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I claim my OpenAI bill?</h3>
              <p className="text-white/60 text-sm">
                Yes. Also Vercel, Cursor, contractors, ads, your laptop. But only if you record it properly. Founders leave thousands on the table by not knowing.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-white mb-2">When do I register for VAT?</h3>
              <div className="bg-destructive/20 border border-destructive/30 rounded-lg p-3 mb-3">
                <p className="text-destructive text-sm font-medium">Threshold</p>
                <p className="text-2xl font-bold text-white">£90,000</p>
              </div>
              <p className="text-white/60 text-sm">
                Rolling 12-month turnover. One viral month can push you over. Miss it by 30 days and you owe back-VAT.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pain Points for Drivers */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary font-medium mb-2">Sound Familiar?</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Tax Headaches Every Driver Knows
          </h2>
          <p className="text-white/70 mb-12">
            You're self-employed. HMRC expects you to track everything. But who has time between drops?
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Mileage Tracking Nightmare</h3>
              <p className="text-white/60 text-sm">
                You drive 100+ miles a day across multiple platforms. Are you tracking every trip? At 45p/mile, that's thousands in tax relief you're probably missing.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">⛽</div>
              <h3 className="text-lg font-semibold text-white mb-2">Lost Fuel Receipts</h3>
              <p className="text-white/60 text-sm">
                That receipt from the petrol station at 6am? Gone. Every lost receipt is money you can't claim back. Fuel is your biggest expense — don't lose it.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-lg font-semibold text-white mb-2">Surprise Tax Bills</h3>
              <div className="bg-destructive/20 border border-destructive/30 rounded-lg p-3 mb-3">
                <p className="text-destructive text-sm font-medium">MTD Deadline</p>
                <p className="text-2xl font-bold text-white">April 2026</p>
              </div>
              <p className="text-white/60 text-sm">
                January comes and you owe HMRC thousands you didn't save for. Making Tax Digital makes this even more urgent.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Personal Story */}
      <section className="py-16 px-4 bg-[hsl(200,16%,24%)]">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">👋</span>
            <p className="text-primary font-medium">It's Personal</p>
            <h2 className="text-3xl font-bold text-white mt-2">Why I Built This</h2>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-white/80 leading-relaxed space-y-4">
            <p>
              I've watched first-time founders build genuinely brilliant products and then get blindsided by HMRC. Surprise £8k tax bills. Missed VAT thresholds. £1,500 Companies House fines for forgetting to file.
            </p>
            <p>
              As an accountant, I kept getting the same panicked DMs: <span className="text-primary">"Should I be Ltd?"</span> <span className="text-primary">"Can I claim my Anthropic bill?"</span> <span className="text-primary">"What's a confirmation statement?"</span> <span className="text-primary">"How much should I save for tax?"</span>
            </p>
            <p>
              Xero and QuickBooks assume you already understand accounting. You don't. That's the whole point. You're a founder, not a bookkeeper.
            </p>
            <p className="text-white font-medium">
              Reelin is built specifically for solo founders. Plain-English lessons. Live VAT threshold tracker. Tax to set aside, calculated weekly. And when you're ready, a one-click handoff to a vetted accountant who actually understands tech founders.
            </p>
          </div>
        </div>
      </section>

      {/* Features for Founders */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">Built for Builders</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything a Founder Needs. Nothing You Don't.
            </h2>
            <p className="text-white/70">
              Not bookkeeping software. A finance co-pilot that explains as it tracks.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Receipt className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Founder Expense Engine</h3>
              <p className="text-white/60 text-sm">
                API credits, hosting, contractor invoices, ads — categorised the way HMRC expects, explained the way founders understand.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Target className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">VAT Threshold Tracker</h3>
              <p className="text-white/60 text-sm">
                Live rolling 12-month turnover vs £90k. Get warned at 80%. Never get caught out by a viral month.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Brain className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Founder Finance 101</h3>
              <p className="text-white/60 text-sm">
                10 lessons covering everything from "Sole trader vs Ltd" to "R&D tax credits". Plain English. Built for first-time founders.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Lightbulb className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Accountant Handoff</h3>
              <p className="text-white/60 text-sm">
                When you're ready, one click hands clean records to a vetted accountant who specialises in tech founders.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder curriculum */}
      <section className="py-16 px-4 bg-[hsl(200,16%,24%)]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Founder Finance 101</h2>
          <p className="text-white/70 mb-12">10 lessons every UK founder should read before their first £10k month</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              "Sole Trader vs Ltd",
              "What You Can Claim",
              "The £90k VAT Threshold",
              "Stripe & Foreign Income",
              "Paying Yourself",
              "R&D Tax Credits",
              "Companies House Basics",
              "When to Hire an Accountant",
              "Saving for Lumpy Tax",
              "MTD ITSA April 2026"
            ].map((topic, i) => (
              <div 
                key={i}
                className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/80 hover:bg-primary/10 hover:border-primary/30 transition-colors"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost of Not Tracking */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              What's It Costing You NOT to Track?
            </h2>
            <p className="text-white/70">
              Most founders leave £3,000–£8,000 on the table every year — and that's before the surprise penalties.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-destructive/10 border-destructive/20 p-6">
              <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold text-white mb-2">Unclaimed SaaS Spend</h3>
              <p className="text-white/60 text-sm">
                £400/mo on tools, hosting, AI APIs = £4,800/yr. Not tracking? You've lost £1,500+ in tax relief.
              </p>
            </Card>
            
            <Card className="bg-warning/10 border-warning/20 p-6">
              <TrendingDown className="h-8 w-8 text-warning mb-4" />
              <h3 className="font-semibold text-white mb-2">Wrong Structure</h3>
              <p className="text-white/60 text-sm">
                Staying sole trader past £40k profit costs the average founder £3,000–£6,000/year in unnecessary tax.
              </p>
            </Card>
            
            <Card className="bg-destructive/10 border-destructive/20 p-6">
              <HeartCrack className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold text-white mb-2">Companies House Fines</h3>
              <p className="text-white/60 text-sm">
                Miss your accounts deadline: £150 → £750 → £1,500 → £7,500. Many solo founders forget. Don't be one.
              </p>
            </Card>
            
            <Card className="bg-warning/10 border-warning/20 p-6">
              <Zap className="h-8 w-8 text-warning mb-4" />
              <h3 className="font-semibold text-white mb-2">Missed VAT Threshold</h3>
              <p className="text-white/60 text-sm">
                Cross £90k turnover, miss the 30-day window, owe back-VAT on every sale. A six-figure mistake.
              </p>
            </Card>
          </div>
          
          <p className="text-center text-xl text-primary font-medium">
            5 minutes a week now saves you a year of regret.
          </p>
        </div>
      </section>

      {/* Why Not Xero/QuickBooks */}
      <section className="py-16 px-4 bg-[hsl(200,16%,24%)]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-primary font-medium mb-2">Why Not Xero or QuickBooks?</p>
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for Founders, Not Accountants
            </h2>
            <p className="text-white/70">
              Xero assumes you already understand accounting. You don't. That's the point.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-destructive/5 border-destructive/20 p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Xero / QuickBooks
              </h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>• Built for accountants, not first-time founders</li>
                <li>• No "should I be Ltd?" prompt — they expect you to know</li>
                <li>• Doesn't teach you what counts as an expense</li>
                <li>• 50 features. You need 5.</li>
                <li>• £15+/month for complexity you didn't ask for</li>
              </ul>
            </Card>
            
            <Card className="bg-primary/5 border-primary/20 p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Reelin
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Purpose-built for solo founders</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Live VAT threshold tracker (£90k)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Founder Finance 101 built in</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Knows your OpenAI bill is deductible</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> One-click handoff to a vetted accountant when you're ready</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(200,16%,24%)] to-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            You're Building the Future.<br />
            <span className="text-primary">Let Reelin Handle the Boring Bits.</span>
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Join the UK founders who'd rather ship product than learn accounting. Real lessons. Real tracking. Real peace of mind.
          </p>
          
          <Button 
            size="xl" 
            onClick={() => navigate("/waitlist")}
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary text-lg px-8"
          >
            Join the Waitlist
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/50">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Founder Finance 101
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              No card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[hsl(200,16%,18%)] border-t border-white/10">
        <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Reelin" className="h-6 w-6 rounded-full" />
            <span className="text-white/60">© 2025 Reelin. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
