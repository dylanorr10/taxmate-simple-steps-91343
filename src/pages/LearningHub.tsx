import { Card } from "@/components/ui/card";
import { Home, FileText, Settings, BookOpen, Video, Award, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LearningHub = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/records", label: "Records", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const lessons = [
    {
      id: 1,
      title: "What counts as a business expense?",
      duration: "5 min read",
      icon: "💰",
      difficulty: "Beginner",
      description: "Learn what you can claim to reduce your tax bill",
    },
    {
      id: 2,
      title: "Understanding your tax timeline",
      duration: "3 min read",
      icon: "📅",
      difficulty: "Beginner",
      description: "Important dates and deadlines made simple",
    },
    {
      id: 3,
      title: "Why keeping records matters",
      duration: "4 min read",
      icon: "🧾",
      difficulty: "Beginner",
      description: "How good records save you money and stress",
    },
    {
      id: 4,
      title: "MTD explained in plain English",
      duration: "6 min read",
      icon: "📊",
      difficulty: "Intermediate",
      description: "Making Tax Digital without the confusing jargon",
    },
    {
      id: 5,
      title: "Profit vs Revenue - What's the difference?",
      duration: "3 min read",
      icon: "📈",
      difficulty: "Beginner",
      description: "Understanding the money you make vs money you keep",
    },
    {
      id: 6,
      title: "Receipt keeping made easy",
      duration: "5 min read",
      icon: "📸",
      difficulty: "Beginner",
      description: "What to keep, how long, and why it matters",
    },
  ];

  const videos = [
    {
      id: 1,
      title: "Sarah explains: Tracking delivery driver expenses",
      duration: "2:30",
      views: "1.2k",
    },
    {
      id: 2,
      title: "Ahmed's story: From confused to confident",
      duration: "3:15",
      views: "890",
    },
    {
      id: 3,
      title: "Dave's tips: What receipts electricians need",
      duration: "2:45",
      views: "1.5k",
    },
  ];

  const badges = [
    { name: "Basic Expenses", earned: true, icon: "✅" },
    { name: "Record Keeper", earned: true, icon: "✅" },
    { name: "Tax Timeline", earned: false, icon: "🔒" },
    { name: "MTD Ready", earned: false, icon: "🔒" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/settings" className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 mb-2">
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tax Made Simple</h1>
          <p className="text-muted-foreground">
            Learn at your own pace - no jargon, no stress
          </p>
        </div>

        {/* Knowledge Builder Progress */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Knowledge Builder</h2>
              <p className="text-sm text-muted-foreground">You've mastered 2 of 4 topics</p>
            </div>
          </div>
          <div className="flex gap-2">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`flex-1 p-3 rounded-lg text-center ${
                  badge.earned
                    ? "bg-success/20 border border-success/30"
                    : "bg-muted/50 border border-muted"
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium">{badge.name}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bite-sized Lessons */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Bite-sized Lessons
          </h2>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{lesson.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {lesson.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {lesson.description}
                    </p>
                    <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Explanations */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Explanations
          </h2>
          <div className="space-y-3">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{video.duration}</span>
                      <span>•</span>
                      <span>{video.views} views</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/glossary">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">Tax Dictionary</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm">Community Q&A</span>
          </Button>
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

export default LearningHub;
