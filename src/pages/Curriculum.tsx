import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Trophy, Target, Loader2 } from "lucide-react";
import { useLessons, useUserProgress } from "@/hooks/useLessons";
import { LessonCard } from "@/components/learning/LessonCard";
import BottomNav from "@/components/BottomNav";


const CATEGORIES = [
  "All",
  "Getting Started",
  "Tax",
  "Expenses",
  "VAT",
  "Bookkeeping",
  "Financial Statements",
  "Compliance",
  "Payroll",
  "Admin",
];

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

const Curriculum = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: progress, isLoading: progressLoading } = useUserProgress();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const progressMap = useMemo(() => {
    if (!progress) return new Map();
    return new Map(progress.map(p => [p.lesson_id, p]));
  }, [progress]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || lesson.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "All" || lesson.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [lessons, searchQuery, selectedCategory, selectedDifficulty]);

  const stats = useMemo(() => {
    if (!lessons || !progress) return { completed: 0, total: 0, inProgress: 0 };
    const completed = progress.filter(p => p.completed_at).length;
    const inProgress = progress.filter(p => p.started_at && !p.completed_at).length;
    return { completed, total: lessons.length, inProgress };
  }, [lessons, progress]);

  const isLoading = lessonsLoading || progressLoading;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Curriculum</h1>
              <p className="text-sm text-muted-foreground">Master business finance, one lesson at a time</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </Card>
            <Card className="p-3 bg-green-500/5 border-green-500/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Complete</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stats.completed}</p>
            </Card>
            <Card className="p-3 bg-amber-500/5 border-amber-500/20">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">In Progress</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stats.inProgress}</p>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {DIFFICULTIES.map(diff => (
              <Badge
                key={diff}
                variant={selectedDifficulty === diff ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff}
              </Badge>
            ))}
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              {CATEGORIES.map(cat => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No lessons found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                progress={progressMap.get(lesson.id)}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Curriculum;
