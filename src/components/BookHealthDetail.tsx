import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, AlertCircle, AlertTriangle, CheckCircle, BookOpen } from "lucide-react";
import type { BookHealthResult, ScoreIssue } from "@/lib/bookHealthScore";
import { scoreLabel, scoreToneClass } from "@/lib/bookHealthScore";
import { InlineLesson } from "@/components/InlineLesson";
import { lessons } from "@/data/learningContent";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  result: BookHealthResult;
}

export const BookHealthDetail = ({ open, onOpenChange, result }: Props) => {
  const navigate = useNavigate();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const { score, breakdown, fixNow, improve, allGood } = result;

  const goTo = (link?: string) => {
    if (!link) return;
    onOpenChange(false);
    navigate(link);
  };

  const lesson = activeLessonId ? lessons.find(l => l.id === activeLessonId) : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Book Health Score
            </DialogTitle>
            <DialogDescription>
              <span className={`text-3xl font-bold ${scoreToneClass(score)}`}>{score}</span>
              <span className="ml-2 text-muted-foreground">{scoreLabel(score)}</span>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] px-6 pb-6">
            {/* Category breakdown */}
            <section className="space-y-3 mb-6">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Categories
              </h4>
              {breakdown.map(cat => (
                <div key={cat.key}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm font-medium">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.score}/100 · {Math.round(cat.weight * 100)}% weight
                    </span>
                  </div>
                  <Progress value={cat.score} className="h-2" />
                </div>
              ))}
            </section>

            {/* Action lists */}
            <IssueGroup
              title="Fix now"
              icon={<AlertCircle className="w-4 h-4 text-destructive" />}
              issues={fixNow}
              defaultOpen
              emptyMessage="Nothing critical to fix. Nice."
              onIssueClick={goTo}
              onLessonClick={setActiveLessonId}
            />
            <IssueGroup
              title="Improve"
              icon={<AlertTriangle className="w-4 h-4 text-warning" />}
              issues={improve}
              onIssueClick={goTo}
              onLessonClick={setActiveLessonId}
            />
            <IssueGroup
              title="All good"
              icon={<CheckCircle className="w-4 h-4 text-success" />}
              issues={allGood}
              onIssueClick={goTo}
              onLessonClick={setActiveLessonId}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {lesson && (
        <InlineLesson
          isOpen={!!activeLessonId}
          onClose={() => setActiveLessonId(null)}
          title={lesson.title}
          content={typeof lesson.content === "string" ? lesson.content : ""}
          emoji={lesson.icon}
          lessonId={lesson.id}
        />
      )}
    </>
  );
};

interface GroupProps {
  title: string;
  icon: React.ReactNode;
  issues: ScoreIssue[];
  defaultOpen?: boolean;
  emptyMessage?: string;
  onIssueClick: (link?: string) => void;
  onLessonClick: (id: string) => void;
}

const IssueGroup = ({ title, icon, issues, defaultOpen, emptyMessage, onIssueClick, onLessonClick }: GroupProps) => {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-3">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">({issues.length})</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-1.5">
        {issues.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-2">{emptyMessage || "Nothing here."}</p>
        ) : (
          issues.map(issue => (
            <div
              key={issue.id}
              className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              <button
                type="button"
                onClick={() => onIssueClick(issue.link)}
                className="flex-1 text-left disabled:cursor-default"
                disabled={!issue.link}
              >
                <div className="text-sm font-medium text-foreground">{issue.title}</div>
                {issue.detail && (
                  <div className="text-xs text-muted-foreground mt-0.5">{issue.detail}</div>
                )}
                {issue.lessonId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLessonClick(issue.lessonId!);
                    }}
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    Why this matters →
                  </button>
                )}
              </button>
              {issue.link && (
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
            </div>
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
