import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  Target, 
  Eye, 
  Brain, 
  Lightbulb, 
  Clock, 
  Zap,
  AlertTriangle,
  TrendingDown,
  HeartCrack,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Flame
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
          <Button 
            variant="outline" 
            onClick={() => navigate("/waitlist")}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Join Waitlist
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">📊</div>
        <div className="absolute top-40 right-20 text-4xl opacity-15 animate-pulse delay-300">🔥</div>
        <div className="absolute bottom-10 left-1/4 opacity-10">
          <BarChart3 className="h-24 w-24 text-primary" />
        </div>
        
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: App Preview */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-2xl p-4 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="ml-2 text-xs text-muted-foreground">Reelin Dashboard</span>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="bg-success-light rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-success font-bold">62</span>
                      <span className="text-xs text-muted-foreground">Lessons Done</span>
                    </div>
                    <div className="bg-primary-light rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-primary font-bold">47</span>
                      <span className="text-xs text-muted-foreground">Quiz Score</span>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <h4 className="font-semibold text-foreground mb-2">Bookkeeping Fundamentals</h4>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div className="bg-primary h-2 rounded-full w-[80%]" />
                    </div>
                    <span className="text-xs text-muted-foreground">80% complete</span>
                  </div>
                </div>
              </div>
              {/* Streak badge */}
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-xl px-4 py-3 shadow-lg transform rotate-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">45</span>
                  <Flame className="h-5 w-5" />
                </div>
                <span className="text-xs">Day Streak</span>
              </div>
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
                The Best Business Owners Know Their Numbers
              </h1>
              
              <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-6 inline-flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Built for business owners who want to understand, not just outsource</span>
              </div>
              
              <p className="text-lg text-white/80 mb-4">
                You didn't start a business to hand over your finances to someone else.{" "}
                <span className="text-primary font-semibold">Take control in just 10 minutes a day.</span>
              </p>

              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Know Your Numbers
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <Trophy className="h-4 w-4 text-primary" />
                  Make Confident Decisions
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <Eye className="h-4 w-4 text-primary" />
                  Stop Flying Blind
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
                🎁 Get early access + free UK expenses checklist
              </p>
              <p className="text-xs text-white/40 mt-2">
                3 free lessons • 10 mins/day • No card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MTD Warning Section */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-primary font-medium mb-2">2025 Changed Everything</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why UK Business Owners Need This Now
          </h2>
          <p className="text-white/70 mb-12">
            The rules are changing. The economy is uncertain. And financial confusion costs more than ever.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-white mb-2">Making Tax Digital (MTD)</h3>
              <div className="bg-destructive/20 border border-destructive/30 rounded-lg p-3 mb-4">
                <p className="text-destructive text-sm font-medium">MTD Deadline</p>
                <p className="text-2xl font-bold text-white">April 2026</p>
              </div>
              <p className="text-white/60 text-sm">
                MTD for Income Tax kicks in soon. Are you ready? The penalties for non-compliance are real.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">Economic Uncertainty</h3>
              <p className="text-white/60 text-sm">
                Rising costs, interest rates, cash flow pressure. Business owners who understand their numbers adapt faster and survive longer.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-left">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-lg font-semibold text-white mb-2">The Cost of Confusion</h3>
              <p className="text-white/60 text-sm">
                Panic, overwhelm, and costly mistakes happen when you don't understand your finances. It doesn't have to be this way.
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
              When my dad went self-employed, he was completely lost. Tax returns, expenses, VAT thresholds - it was overwhelming. He's a smart guy, but this stuff made him feel stupid.
            </p>
            <p>
              Then my friends started their own businesses and came to me with the same questions. <span className="text-primary">"What expenses can I claim?"</span> <span className="text-primary">"Do I need to register for VAT?"</span> <span className="text-primary">"How does Making Tax Digital work?"</span>
            </p>
            <p>
              As an accountant, I saw a pattern: smart, capable people who felt lost when it came to their finances. Not because they couldn't understand it - but because no one explained it in a way that made sense.
            </p>
            <p className="text-white font-medium">
              That's why I created Reelin. Not to replace your accountant, but to make sure you never feel lost, confused, or at the mercy of someone else's advice again. You built your business. You should understand what makes it tick financially.
            </p>
          </div>
        </div>
      </section>

      {/* You CAN Do This */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">You CAN Do This</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Master Your Finances in 10 Minutes a Day
            </h2>
            <p className="text-white/70">
              You CAN understand this. No jargon. No overwhelm. Just practical knowledge that compounds over time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Brain className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Compound Learning</h3>
              <p className="text-white/60 text-sm">
                5-10 minutes a day adds up. In 30 days, you'll understand more than most business owners learn in years.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Lightbulb className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Real UK Examples</h3>
              <p className="text-white/60 text-sm">
                Not generic advice. Actual scenarios for self-employed, sole traders, and limited companies in the UK.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Target className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Bite-Sized & Practical</h3>
              <p className="text-white/60 text-sm">
                No 2-hour courses. Each lesson teaches you something useful you can apply today.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Clock className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Built for Busy People</h3>
              <p className="text-white/60 text-sm">
                Fit learning around your business. On the train, during lunch, before bed. It works around you.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 px-4 bg-[hsl(200,16%,24%)]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Master UK Business Finances</h2>
          <p className="text-white/70 mb-12">20+ comprehensive lessons covering everything you need to know</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              "Understanding Profit & Loss",
              "Making Tax Digital (MTD)",
              "Claiming Expenses Correctly",
              "VAT Explained Simply",
              "Mileage & Home Office",
              "CIS for Construction",
              "Professional Invoicing",
              "Tax Planning Strategies",
              "Record Keeping",
              "Automating Bookkeeping"
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

      {/* Cost of Confusion */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              What's the Cost of Financial Confusion?
            </h2>
            <p className="text-white/70">
              When you don't understand your finances, everything becomes harder and more expensive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-destructive/10 border-destructive/20 p-6">
              <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold text-white mb-2">Expensive Mistakes</h3>
              <p className="text-white/60 text-sm">
                Claiming the wrong expenses, missing deadlines, overpaying tax - ignorance is expensive.
              </p>
            </Card>
            
            <Card className="bg-warning/10 border-warning/20 p-6">
              <TrendingDown className="h-8 w-8 text-warning mb-4" />
              <h3 className="font-semibold text-white mb-2">Slower Decisions</h3>
              <p className="text-white/60 text-sm">
                When you don't know your numbers, every financial decision feels risky and takes longer.
              </p>
            </Card>
            
            <Card className="bg-destructive/10 border-destructive/20 p-6">
              <HeartCrack className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold text-white mb-2">Stress & Anxiety</h3>
              <p className="text-white/60 text-sm">
                That knot in your stomach when you think about your accounts? It doesn't have to be there.
              </p>
            </Card>
            
            <Card className="bg-warning/10 border-warning/20 p-6">
              <Zap className="h-8 w-8 text-warning mb-4" />
              <h3 className="font-semibold text-white mb-2">Competitive Disadvantage</h3>
              <p className="text-white/60 text-sm">
                Business owners who understand their finances spot opportunities faster and adapt quicker.
              </p>
            </Card>
          </div>
          
          <p className="text-center text-xl text-primary font-medium">
            Knowledge isn't just power. It's peace of mind.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(200,16%,24%)] to-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            You Built Your Business.<br />
            <span className="text-primary">Now Understand Its Finances.</span>
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Join thousands of UK business owners who stopped outsourcing their understanding and started taking control. 10 minutes a day. Real knowledge. Real confidence.
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
              3 free lessons
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
