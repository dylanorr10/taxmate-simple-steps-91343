import { useState } from "react";
import { BookOpen } from "lucide-react";
import { InlineLesson } from "./InlineLesson";
import { lessons } from "@/data/learningContent";
import { useLearningProgress } from "@/hooks/useLearningProgress";

interface LessonQuickLinkProps {
  lessonId: string;
  linkText?: string;
}

export const LessonQuickLink = ({ lessonId, linkText = "Learn more" }: LessonQuickLinkProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { startLesson } = useLearningProgress();

  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) return null;

  const handleOpen = () => {
    setIsOpen(true);
    startLesson(lessonId);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 underline transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        {linkText}
      </button>
      <InlineLesson
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={lesson.title}
        content={lesson.content}
        emoji={lesson.icon}
      />
    </>
  );
};