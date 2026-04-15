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
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">🚗</div>
        <div className="absolute top-40 right-20 text-4xl opacity-15 animate-pulse delay-300">📍</div>
        <div className="absolute bottom-10 left-1/4 opacity-10">
          <Car className="h-24 w-24 text-primary" />
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
                  <span className="text-xl font-bold">1,247</span>
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-[10px]">Miles Tracked</span>
              </div>
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
                Built for Delivery Drivers. Track Miles. Claim Expenses. Stay HMRC-Ready.
              </h1>
              
              <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-6 inline-flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Uber · Deliveroo · Amazon Flex · Evri · DPD · Just Eat</span>
              </div>
              
              <p className="text-lg text-white/80 mb-4">
                You're driving all day. You shouldn't have to spend all night doing your books.{" "}
                <span className="text-primary font-semibold">Track mileage, snap receipts, and stay tax-ready in minutes.</span>
              </p>

              <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <MapPin className="h-4 w-4 text-primary" />
                  Auto Mileage Tracking
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <Receipt className="h-4 w-4 text-primary" />
                  Snap Fuel Receipts
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/90">
                  <Zap className="h-4 w-4 text-primary" />
                  MTD Ready
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
                🎁 Get early access + free driver expenses checklist
              </p>
              <p className="text-xs text-white/40 mt-2">
                3 free lessons • 5 mins/day • No card required
              </p>
            </div>
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
              I've seen delivery drivers work 12-hour days, smash their targets on Uber and Deliveroo, then get hit with a tax bill they weren't prepared for. It happens every year.
            </p>
            <p>
              As an accountant, I kept getting the same questions: <span className="text-primary">"Can I claim my phone mount?"</span> <span className="text-primary">"What about the Uber service fee?"</span> <span className="text-primary">"How do I track mileage when I'm doing 20 drops a day?"</span>
            </p>
            <p>
              The tools out there are either too complicated, too expensive, or not built for how drivers actually work — on the road, between deliveries, at the petrol station.
            </p>
            <p className="text-white font-medium">
              Reelin is built specifically for you. Log a trip in 5 seconds. Snap a fuel receipt at the pump. Know exactly how much tax to save each week. No accounting degree required.
            </p>
          </div>
        </div>
      </section>

      {/* Features for Drivers */}
      <section className="py-16 px-4 bg-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">Built for the Road</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything a Driver Needs. Nothing You Don't.
            </h2>
            <p className="text-white/70">
              Designed to work between drops, at red lights, and at the petrol station.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">One-Tap Mileage</h3>
              <p className="text-white/60 text-sm">
                Log trips in seconds. See your 45p/mile deduction grow in real-time. Know when you hit the 10,000-mile threshold.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Smartphone className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Snap Receipts</h3>
              <p className="text-white/60 text-sm">
                Photograph fuel receipts, phone bills, and expenses. Never lose a receipt again. HMRC-ready records.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Brain className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Learn As You Go</h3>
              <p className="text-white/60 text-sm">
                5-minute lessons explaining what you can claim, how tax works, and how to save money. Written for drivers, not accountants.
              </p>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
              <Lightbulb className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Tax Set-Aside</h3>
              <p className="text-white/60 text-sm">
                Know exactly how much to save each week for your tax bill. No January surprises. Peace of mind.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Driver-specific curriculum */}
      <section className="py-16 px-4 bg-[hsl(200,16%,24%)]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Learn What Actually Matters</h2>
          <p className="text-white/70 mb-12">Lessons written specifically for delivery drivers</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              "Tax Basics for Drivers",
              "Mileage: 45p vs Actual Costs",
              "Fuel VAT Recovery",
              "What Expenses Can You Claim?",
              "Platform Fees & Deductions",
              "Making Tax Digital (MTD)",
              "Saving for Your Tax Bill",
              "Vehicle Costs Explained",
              "Receipt Keeping Made Easy",
              "Your First Tax Return"
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
              Most drivers leave £2,000–£4,000 on the table every year in unclaimed expenses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-destructive/10 border-destructive/20 p-6">
              <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold text-white mb-2">Unclaimed Mileage</h3>
              <p className="text-white/60 text-sm">
                20,000 miles × 45p = £9,000 in deductions. If you're not tracking, you're losing up to £2,700 in tax relief.
              </p>
            </Card>
            
            <Card className="bg-warning/10 border-warning/20 p-6">
              <TrendingDown className="h-8 w-8 text-warning mb-4" />
              <h3 className="font-semibold text-white mb-2">Lost Receipts</h3>
              <p className="text-white/60 text-sm">
                £50/week in fuel with no receipt = £2,600/year you can't claim. That's £780 in lost tax savings.
              </p>
            </Card>
            
            <Card className="bg-destructive/10 border-destructive/20 p-6">
              <HeartCrack className="h-8 w-8 text-destructive mb-4" />
              <h3 className="font-semibold text-white mb-2">January Panic</h3>
              <p className="text-white/60 text-sm">
                Scrambling to find 12 months of records in January. Paying an accountant £500+ because you left it too late.
              </p>
            </Card>
            
            <Card className="bg-warning/10 border-warning/20 p-6">
              <Zap className="h-8 w-8 text-warning mb-4" />
              <h3 className="font-semibold text-white mb-2">MTD Penalties</h3>
              <p className="text-white/60 text-sm">
                From April 2026, HMRC requires digital records. Late or incorrect submissions mean penalties up to £400+.
              </p>
            </Card>
          </div>
          
          <p className="text-center text-xl text-primary font-medium">
            5 minutes a day now saves you thousands a year.
          </p>
        </div>
      </section>

      {/* Why Not QuickBooks */}
      <section className="py-16 px-4 bg-[hsl(200,16%,24%)]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-primary font-medium mb-2">Why Not QuickBooks?</p>
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for Drivers, Not Accountants
            </h2>
            <p className="text-white/70">
              Generic accounting apps weren't designed for life on the road.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-destructive/5 border-destructive/20 p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                QuickBooks
              </h3>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>• Built for accountants, not drivers</li>
                <li>• No mileage threshold tracking (45p → 25p)</li>
                <li>• Doesn't know Uber from Deliveroo</li>
                <li>• You pay for 50 features. You need 5.</li>
                <li>• £12/month for complexity you don't want</li>
              </ul>
            </Card>
            
            <Card className="bg-primary/5 border-primary/20 p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Reelin
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Purpose-built for delivery drivers</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Tracks your 45p/25p mileage threshold automatically</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Knows your platform fees are deductible</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Only the features you actually use</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> From £4.99/month — less than half the price</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(200,16%,24%)] to-[hsl(200,16%,20%)]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            You Drive for a Living.<br />
            <span className="text-primary">Let Reelin Handle the Tax.</span>
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Join hundreds of UK delivery drivers who stopped guessing and started tracking. 5 minutes a day. Real savings. Real peace of mind.
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
