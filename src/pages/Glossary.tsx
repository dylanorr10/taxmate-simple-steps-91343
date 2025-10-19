import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, FileText, Settings, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Glossary = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/tax", label: "Tax", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const glossaryTerms = [
    {
      term: "Business Expenses",
      icon: "💸",
      explanation: "Things you buy to do your job - fuel, tools, phone bills, materials. Keep the receipts and you'll pay less tax because they reduce your profit.",
      example: "Dave the electrician buys £50 of cable. That's a business expense - it comes off his taxable profit.",
      relatedTerms: ["Profit", "Receipts", "Allowable Expenses"],
    },
    {
      term: "Profit",
      icon: "💰",
      explanation: "This is what's left after you pay for all your business costs - the money you actually get to keep. This is what you pay tax on, not your total income.",
      example: "If you earn £1,000 this week and spend £200 on business costs, your profit is £800.",
      relatedTerms: ["Revenue", "Business Expenses", "Taxable Income"],
    },
    {
      term: "Revenue (Turnover)",
      icon: "💵",
      explanation: "The total money that comes into your business before you pay for anything. It's all the money customers pay you.",
      example: "Sarah the delivery driver earns £500 this week from deliveries. That's her revenue.",
      relatedTerms: ["Profit", "Income"],
    },
    {
      term: "MTD (Making Tax Digital)",
      icon: "📊",
      explanation: "HMRC's new way of doing tax returns online using software (like Reelin!). You'll need it when you earn over £30k. Don't worry - we handle all the technical bits for you.",
      example: "Instead of paper forms, you'll submit your taxes through this app. Much easier!",
      relatedTerms: ["Self Assessment", "Tax Return", "HMRC"],
    },
    {
      term: "Self Assessment",
      icon: "📋",
      explanation: "The yearly tax return you fill in to tell HMRC how much you earned and what tax you owe. Due by 31st January each year.",
      example: "Every January, you tell HMRC about last year's income and pay any tax you owe.",
      relatedTerms: ["MTD", "Tax Return", "Tax Deadline"],
    },
    {
      term: "Allowable Expenses",
      icon: "✅",
      explanation: "Business costs that HMRC lets you deduct from your income to reduce your tax bill. Must be 'wholly and exclusively' for business.",
      example: "Your work van fuel: yes ✅ Your personal shopping: no ❌",
      relatedTerms: ["Business Expenses", "Tax Relief"],
    },
    {
      term: "VAT",
      icon: "🏷️",
      explanation: "Value Added Tax - an extra charge (20%) that some businesses add to their prices and pass to the government. You only need to register if you earn over £90k.",
      example: "A £100 job becomes £120 with VAT. You keep the £100, give HMRC the £20.",
      relatedTerms: ["VAT Registration", "VAT Threshold"],
    },
    {
      term: "National Insurance",
      icon: "🏥",
      explanation: "Payments that give you access to benefits like State Pension and NHS. Self-employed people pay Class 2 (flat rate) and Class 4 (based on profits).",
      example: "Think of it like a membership fee for the social safety net.",
      relatedTerms: ["Class 2 NI", "Class 4 NI"],
    },
    {
      term: "Tax Year",
      icon: "📅",
      explanation: "Runs from 6th April to 5th April (not January to December!). This is the period you report your earnings for.",
      example: "Tax year 2024/25 means 6th April 2024 to 5th April 2025.",
      relatedTerms: ["Self Assessment", "Tax Deadline"],
    },
    {
      term: "Receipts",
      icon: "🧾",
      explanation: "Proof you bought something for your business. Keep them for at least 5 years! Photos on your phone count.",
      example: "Fuel receipt, tool invoice, phone bill - snap a photo and log it in Reelin.",
      relatedTerms: ["Business Expenses", "Record Keeping"],
    },
    {
      term: "Tax Code",
      icon: "🔢",
      explanation: "A code that tells employers how much tax to take from wages. If you're fully self-employed, you might not have one.",
      example: "1257L is the standard code for most people in 2024/25.",
      relatedTerms: ["PAYE", "Income Tax"],
    },
    {
      term: "Personal Allowance",
      icon: "🎁",
      explanation: "The amount you can earn tax-free each year. For 2024/25 it's £12,570. You only pay tax on profit above this.",
      example: "If your profit is £15,000, you only pay tax on £2,430 (£15,000 - £12,570).",
      relatedTerms: ["Tax-Free Income", "Taxable Income"],
    },
  ];

  const filteredTerms = glossaryTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/learning" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mb-2">
            ← Back to Learning Hub
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tax Dictionary</h1>
          <p className="text-muted-foreground">
            Actually useful explanations (no confusing jargon!)
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for a term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Terms */}
        <div className="space-y-4">
          {filteredTerms.map((item) => (
            <Card key={item.term} className="p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.term}</h3>
                  <p className="text-foreground leading-relaxed mb-3">
                    {item.explanation}
                  </p>
                  
                  <div className="bg-primary/5 border-l-4 border-primary p-3 rounded mb-3">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-primary">Real example:</span> {item.example}
                    </p>
                  </div>

                  {item.relatedTerms.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Related terms:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.relatedTerms.map((related) => (
                          <span
                            key={related}
                            className="text-xs px-2 py-1 rounded-full bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          >
                            {related}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No terms found. Try searching for something else!
            </p>
          </Card>
        )}
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

export default Glossary;
