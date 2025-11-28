import { Card } from "@/components/ui/card";
import { Award, BookOpen, Search, Filter, Clock, CheckCircle, Play, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { lessons } from "@/data/learningContent";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import BottomNav from "@/components/BottomNav";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { InlineLesson } from "@/components/InlineLesson";

const LearningHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLesson, setSelectedLesson] = useState<typeof lessons[0] | null>(null);
  const { progress, isLoading: progressLoading, startLesson } = useLearningProgress();
  const { data: businessProfile } = useBusinessProfile();

  const handleOpenLesson = (lesson: typeof lessons[0]) => {
    setSelectedLesson(lesson);
    startLesson(lesson.id);
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(lessons.map(l => l.category)));
    return ['all', ...cats];
  }, []);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = 
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = 
        selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
      
      const matchesCategory = 
        selectedCategory === 'all' || lesson.category === selectedCategory;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [searchQuery, selectedDifficulty, selectedCategory]);

  // Get lesson progress
  const getLessonProgress = (lessonId: string) => {
    return progress?.find(p => p.lesson_id === lessonId);
  };

  // Get in-progress lessons
  const inProgressLessons = useMemo(() => {
    if (!progress) return [];
    return lessons.filter(lesson => {
      const prog = getLessonProgress(lesson.id);
      return prog && !prog.completed_at && prog.completion_rate && prog.completion_rate > 0;
    }).slice(0, 3);
  }, [progress]);

  // Get completed count
  const completedCount = useMemo(() => {
    if (!progress) return 0;
    return progress.filter(p => p.completed_at).length;
  }, [progress]);

  // Get recommended lessons based on business type
  const recommendedLessons = useMemo(() => {
    const businessType = businessProfile?.businessType;
    const recommended: typeof lessons = [];

    if (businessType === 'trades') {
      recommended.push(
        ...lessons.filter(l => ['cis-basics', 'mileage-tracking', 'claiming-expenses'].includes(l.id))
      );
    } else if (businessType === 'transport') {
      recommended.push(
        ...lessons.filter(l => ['mileage-tracking', 'claiming-expenses', 'vat-explained'].includes(l.id))
      );
    } else if (businessType === 'creative') {
      recommended.push(
        ...lessons.filter(l => ['home-office', 'invoicing-clients', 'claiming-expenses'].includes(l.id))
      );
    }

    // Fill remaining with beginner lessons
    const beginnerLessons = lessons.filter(l => 
      l.difficulty === 'beginner' && !recommended.find(r => r.id === l.id)
    );
    
    return [...recommended, ...beginnerLessons].slice(0, 3);
  }, [businessProfile]);

  const difficultyColors = {
    beginner: 'bg-success/10 text-success border-success/20',
    intermediate: 'bg-primary/10 text-primary border-primary/20',
    advanced: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const renderLessonCard = (lesson: typeof lessons[0]) => {
    const lessonProgress = getLessonProgress(lesson.id);
    const isCompleted = lessonProgress?.completed_at;
    const progressPercent = lessonProgress?.completion_rate || 0;

    return (
      <Card
        key={lesson.id}
        onClick={() => handleOpenLesson(lesson)}
        className="p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group"
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">{lesson.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
                {lesson.title}
              </h3>
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={difficultyColors[lesson.difficulty]}>
                {lesson.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.duration}
              </span>
              <Badge variant="outline">{lesson.category}</Badge>
            </div>

            {progressPercent > 0 && !isCompleted && (
              <div className="mb-2">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {Math.round(progressPercent)}% complete
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenLesson(lesson);
                }}
              >
                {isCompleted ? 'Review' : progressPercent > 0 ? 'Continue' : 'Start Learning'}
                <Play className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Learning Hub</h1>
          <p className="text-muted-foreground lg:text-lg">
            Build your tax knowledge at your own pace
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount} of {lessons.length} lessons completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round((completedCount / lessons.length) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${(completedCount / lessons.length) * 100}%` }}
            />
          </div>
        </Card>

        {/* Continue Learning Section */}
        {inProgressLessons.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Continue Learning
            </h2>
            <div className="space-y-3">
              {inProgressLessons.map(lesson => renderLessonCard(lesson))}
            </div>
          </div>
        )}

        {/* Recommended for You */}
        {recommendedLessons.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Recommended for You
            </h2>
            <div className="space-y-3">
              {recommendedLessons.map(lesson => renderLessonCard(lesson))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('all')}
            >
              All Levels
            </Button>
            <Button
              variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('beginner')}
            >
              Beginner
            </Button>
            <Button
              variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('intermediate')}
            >
              Intermediate
            </Button>
            <Button
              variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty('advanced')}
            >
              Advanced
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All Topics' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* All Lessons */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {searchQuery || selectedDifficulty !== 'all' || selectedCategory !== 'all' 
              ? `${filteredLessons.length} Lessons Found` 
              : 'All Lessons'}
          </h2>
          
          {filteredLessons.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-muted-foreground">
                No lessons found matching your search.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('all');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLessons.map(lesson => renderLessonCard(lesson))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 lg:gap-6">
          <Card className="p-4 lg:p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary">{completedCount}</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Completed</div>
          </Card>
          <Card className="p-4 lg:p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-accent">{inProgressLessons.length}</div>
            <div className="text-xs lg:text-sm text-muted-foreground">In Progress</div>
          </Card>
          <Card className="p-4 lg:p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-muted-foreground">
              {lessons.length - completedCount - inProgressLessons.length}
            </div>
            <div className="text-xs lg:text-sm text-muted-foreground">Not Started</div>
          </Card>
        </div>
      </div>

      <BottomNav />
      
      {selectedLesson && (
        <InlineLesson
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          title={selectedLesson.title}
          content={selectedLesson.content}
          emoji={selectedLesson.icon}
          lessonId={selectedLesson.id}
          quiz={selectedLesson.quiz}
        />
      )}
    </div>
  );
};

export default LearningHub;
