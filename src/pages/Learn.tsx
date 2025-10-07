import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const Learn = () => {
  const { toast } = useToast();
  const [savedLessons, setSavedLessons] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [showLesson, setShowLesson] = useState<number | null>(null);

  const toggleSave = (index: number) => {
    setSavedLessons(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    toast({
      title: savedLessons.includes(index) ? "Removed from saved" : "Saved!",
      description: savedLessons.includes(index) 
        ? "Lesson removed from your saved list" 
        : "Added to your saved lessons",
    });
  };

  const openLesson = (index: number) => {
    setShowLesson(index);
    if (!completedLessons.includes(index)) {
      setCompletedLessons(prev => [...prev, index]);
    }
  };

  const lessons = [
    {
      title: "Claiming tools & equipment",
      description: "What you can claim and evidence to keep",
      emoji: "🔧",
      category: "Expenses",
      duration: "3 min read",
      content: "As a sole trader, you can claim tax relief on tools and equipment used exclusively for your business. This includes power tools, hand tools, safety equipment, and specialized machinery. Keep all receipts and record the date of purchase, item description, and business use percentage. Tools under £1,000 can be claimed in full in the year of purchase through Annual Investment Allowance."
    },
    {
      title: "VAT basics for trades",
      description: "When VAT applies to parts vs labour",
      emoji: "💷",
      category: "Tax",
      duration: "5 min read",
      content: "You must register for VAT if your turnover exceeds £85,000 in a 12-month period. VAT applies to both parts and labour in most trades. Standard rate is 20%. Some work qualifies for reduced rates (5%) like energy-saving materials installation. Keep detailed VAT records and submit returns quarterly or monthly depending on your scheme."
    },
    {
      title: "Keeping site records",
      description: "Job sheets, receipts and client proofs",
      emoji: "📋",
      category: "Record Keeping",
      duration: "4 min read",
      content: "Maintain comprehensive job records including date, client details, work performed, materials used, time spent, and photos of completed work. Keep all receipts for at least 6 years. Digital copies are acceptable if clear and legible. Use job sheets to track progress and as proof of work for warranty claims."
    },
    {
      title: "Health & Safety checklist",
      description: "Keep compliant on site and avoid fines",
      emoji: "⚠️",
      category: "Compliance",
      duration: "6 min read",
      content: "Every tradesperson must conduct risk assessments before starting work. Essential requirements: valid public liability insurance (minimum £1m-£5m), appropriate PPE, method statements for high-risk work, emergency procedures, and first aid provisions. HSE can fine up to £20,000 for non-compliance."
    },
    {
      title: "Invoice best practices",
      description: "How to create professional invoices that get paid faster",
      emoji: "📄",
      category: "Business",
      duration: "5 min read",
      content: "Professional invoices should include: unique invoice number, your business details, client details, work description, breakdown of costs, payment terms (typically 14-30 days), and accepted payment methods. Send invoices immediately after job completion. Follow up on overdue payments after 7 days with a polite reminder."
    },
    {
      title: "Understanding profit margins",
      description: "Calculate your true earnings after costs",
      emoji: "💰",
      category: "Finance",
      duration: "7 min read",
      content: "Profit margin = (Revenue - Costs) / Revenue × 100. Track all costs including materials, tools, fuel, insurance, and your time. Aim for 20-30% net profit margin. If margins are low, review pricing, reduce waste, buy materials in bulk, or improve efficiency. Don't forget to account for tax (20-45% depending on income) and National Insurance."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Learning — Sole Trader Essentials
          </h1>
          <p className="text-muted-foreground mt-1">
            Short, business-specific lessons and tips to help you succeed
          </p>
          {(savedLessons.length > 0 || completedLessons.length > 0) && (
            <div className="mt-3 flex gap-3">
              {savedLessons.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Bookmark className="w-3 h-3" />
                  {savedLessons.length} saved
                </Badge>
              )}
              {completedLessons.length > 0 && (
                <Badge variant="secondary" className="gap-1 bg-success/10 text-success border-success/20">
                  <CheckCircle className="w-3 h-3" />
                  {completedLessons.length} completed
                </Badge>
              )}
            </div>
          )}
        </div>

        <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📚</div>
            <div className="flex-1">
              <h2 className="font-bold text-xl mb-2 text-foreground">Featured Topic</h2>
              <p className="text-sm text-muted-foreground mb-4">
                New to self-employment? Start with our beginner's guide to understand the basics.
              </p>
              <Button size="sm" className="gap-2" onClick={() => openLesson(0)}>
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
                className="p-5 shadow-card hover:shadow-md transition-all border border-border relative"
              >
                {completedLessons.includes(index) && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{lesson.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2 pr-6">
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
                        <Button size="sm" onClick={() => openLesson(index)}>
                          Read
                        </Button>
                        <Button 
                          size="sm" 
                          variant={savedLessons.includes(index) ? "default" : "outline"}
                          className="gap-1"
                          onClick={() => toggleSave(index)}
                        >
                          {savedLessons.includes(index) ? (
                            <BookmarkCheck className="w-3 h-3" />
                          ) : (
                            <Bookmark className="w-3 h-3" />
                          )}
                          {savedLessons.includes(index) ? "Saved" : "Save"}
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

      {/* Lesson Modal */}
      {showLesson !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLesson(null)}
        >
          <div 
            className="bg-card w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 rounded-t-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">{lessons[showLesson].emoji}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-bold text-2xl">{lessons[showLesson].title}</h2>
                  <Badge variant="secondary">{lessons[showLesson].category}</Badge>
                </div>
                <p className="text-muted-foreground">{lessons[showLesson].description}</p>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-foreground leading-relaxed">{lessons[showLesson].content}</p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={() => {
                  toggleSave(showLesson);
                }}
                variant={savedLessons.includes(showLesson) ? "default" : "outline"}
                className="gap-2"
              >
                {savedLessons.includes(showLesson) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {savedLessons.includes(showLesson) ? "Saved" : "Save for later"}
              </Button>
              <Button onClick={() => setShowLesson(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Learn;
