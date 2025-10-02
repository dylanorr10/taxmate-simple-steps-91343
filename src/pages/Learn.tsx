import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FileText,
  BookOpen,
  Shield,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Learn = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/log", label: "Log", icon: FileText },
    { path: "/learn", label: "Learn", icon: BookOpen },
    { path: "/records", label: "Records", icon: Shield },
  ];

  const lessons = [
    {
      title: "Claiming tools & equipment",
      description: "What you can claim and evidence to keep",
      emoji: "🔧",
      category: "Expenses",
      duration: "3 min read",
    },
    {
      title: "VAT basics for trades",
      description: "When VAT applies to parts vs labour",
      emoji: "💷",
      category: "Tax",
      duration: "5 min read",
    },
    {
      title: "Keeping site records",
      description: "Job sheets, receipts and client proofs",
      emoji: "📋",
      category: "Record Keeping",
      duration: "4 min read",
    },
    {
      title: "Health & Safety checklist",
      description: "Keep compliant on site and avoid fines",
      emoji: "⚠️",
      category: "Compliance",
      duration: "6 min read",
    },
    {
      title: "Invoice best practices",
      description: "How to create professional invoices that get paid faster",
      emoji: "📄",
      category: "Business",
      duration: "5 min read",
    },
    {
      title: "Understanding profit margins",
      description: "Calculate your true earnings after costs",
      emoji: "💰",
      category: "Finance",
      duration: "7 min read",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Learn — Sole Trader Essentials
          </h1>
          <p className="text-muted-foreground mt-1">
            Short, business-specific lessons and tips to help you succeed
          </p>
        </div>

        <Card className="p-6 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📚</div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-2">Featured Topic</h2>
              <p className="text-sm text-muted-foreground mb-3">
                New to self-employment? Start with our beginner's guide to understand the basics.
              </p>
              <Button size="sm" className="gap-2">
                Start Learning
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="font-semibold text-lg mb-4">All Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <Card
                key={index}
                className="p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{lesson.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">
                        {lesson.title}
                      </h3>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {lesson.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {lesson.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          Read
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Bookmark className="w-3 h-3" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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

export default Learn;
