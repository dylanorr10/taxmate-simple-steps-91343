import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Trophy, Target, Loader2, Award, Play, TrendingUp, Route, Calendar } from "lucide-react";
import { useLessons, useUserProgress } from "@/hooks/useLessons";
import { LessonCard } from "@/components/learning/LessonCard";
import { LearningPathCard } from "@/components/learning/LearningPathCard";
import { LearningPathJourney } from "@/components/learning/LearningPathJourney";
import { SeasonalLessonBanner } from "@/components/learning/SeasonalLessonBanner";
import BottomNav from "@/components/BottomNav";
import DesktopNav from "@/components/DesktopNav";
import { useProfile } from "@/hooks/useProfile";
import { useLearningPaths, useUserPathProgress, useStartPath } from "@/hooks/useLearningPaths";

const CATEGORIES = [
  "All",
  "Seasonal",
  "Getting Started",
  "Tax",
  "Expenses",
  "VAT",
  "Bookkeeping",
  "Financial Statements",
  "Compliance",
  "Payroll",
  "Admin",
  "Planning",
];

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

const Learn = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: progress, isLoading: progressLoading } = useUserProgress();
  const { data: paths, isLoading: pathsLoading } = useLearningPaths();
  const { data: pathProgress } = useUserPathProgress();
  const startPath = useStartPath();
  const { profile } = useProfile();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"paths" | "lessons">("paths");

  const progressMap = useMemo(() => {
    if (!progress) return new Map();
    return new Map(progress.map(p => [p.lesson_id, p]));
  }, [progress]);

  const lessonCompletionMap = useMemo(() => {
    if (!progress) return new Map<string, boolean>();
    return new Map(progress.map(p => [p.lesson_id, !!p.completed_at]));
  }, [progress]);

  const pathProgressMap = useMemo(() => {
    if (!pathProgress) return new Map();
    return new Map(pathProgress.map(p => [p.path_id, p]));
  }, [pathProgress]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    return lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
      // For "Seasonal" category, filter by lesson_type
      const matchesCategory = selectedCategory === "All" || 
        (selectedCategory === "Seasonal" ? (lesson as any).lesson_type === 'seasonal' : lesson.category === selectedCategory);
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

  const selectedPath = useMemo(() => {
    if (!selectedPathId || !paths) return null;
    return paths.find(p => p.id === selectedPathId) || null;
  }, [selectedPathId, paths]);

  const handleStartPath = async (pathId: string) => {
    await startPath.mutateAsync(pathId);
  };

  const isLoading = lessonsLoading || progressLoading || pathsLoading;
  const completionPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // If viewing a specific path journey
  if (selectedPath && lessons) {
    return (
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        <DesktopNav />
        <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-6 lg:pt-24">
          <LearningPathJourney
            path={selectedPath}
            lessons={lessons}
            progress={pathProgressMap.get(selectedPath.id)}
            lessonCompletionMap={lessonCompletionMap}
            onBack={() => setSelectedPathId(null)}
            onLessonClick={(lessonId) => navigate(`/lesson/${lessonId}`)}
            onStart={() => handleStartPath(selectedPath.id)}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <DesktopNav />
      
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-6 lg:pt-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Learning Hub</h1>
          <p className="text-muted-foreground lg:text-lg">
            Master business finance, one lesson at a time
          </p>
        </div>

        {/* Progress Overview Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
              <p className="text-sm text-muted-foreground">
                {stats.completed} of {stats.total} lessons completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completionPercent}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </Card>

        {/* Seasonal Focus Banner */}
        <div className="mb-6">
          <SeasonalLessonBanner 
            onLessonClick={(lessonId) => navigate(`/lesson/${lessonId}`)} 
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === "paths" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("paths")}
          >
            <Route className="w-4 h-4 mr-2" />
            Learning Paths
          </Button>
          <Button
            variant={viewMode === "lessons" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("lessons")}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            All Lessons
          </Button>
        </div>

        {/* Learning Paths Section */}
        {viewMode === "paths" && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              Choose Your Path
            </h2>
            {pathsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : paths && paths.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {paths.map(path => (
                  <LearningPathCard
                    key={path.id}
                    path={path}
                    progress={pathProgressMap.get(path.id)}
                    lessonCompletionMap={lessonCompletionMap}
                    onClick={() => setSelectedPathId(path.id)}
                    onStart={() => handleStartPath(path.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Route className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No paths available</h3>
                <p className="text-muted-foreground">Learning paths will appear here soon</p>
              </Card>
            )}
          </div>
        )}

        {viewMode === "lessons" && (
          <>
            {/* Search and Filters */}
            <div className="sticky top-0 lg:top-16 z-10 bg-background/95 backdrop-blur py-4 -mx-4 px-4 lg:-mx-8 lg:px-8 border-b border-border mb-4">
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

            {/* All Lessons */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {searchQuery || selectedDifficulty !== 'All' || selectedCategory !== 'All' 
                  ? `${filteredLessons.length} Lessons Found` 
                  : 'All Lessons'}
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredLessons.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No lessons found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDifficulty('All');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLessons.map(lesson => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      progress={undefined}
                      onClick={() => navigate(`/lesson/${lesson.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 lg:gap-6">
              <Card className="p-4 lg:p-6 text-center bg-primary/5 border-primary/20">
                <div className="text-2xl lg:text-3xl font-bold text-primary">{stats.completed}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Completed</div>
              </Card>
              <Card className="p-4 lg:p-6 text-center bg-amber-500/5 border-amber-500/20">
                <div className="text-2xl lg:text-3xl font-bold text-amber-500">{stats.inProgress}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">In Progress</div>
              </Card>
              <Card className="p-4 lg:p-6 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">
                  {stats.total - stats.completed - stats.inProgress}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">Not Started</div>
              </Card>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Learn;
