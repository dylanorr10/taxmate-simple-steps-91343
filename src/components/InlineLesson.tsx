import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getExamples } from "@/data/businessTypeConfig";

interface InlineLessonProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  emoji?: string;
  lessonId?: string;
}

export const InlineLesson = ({ isOpen, onClose, title, content, emoji, lessonId }: InlineLessonProps) => {
  const { data: profile } = useBusinessProfile();
  
  let displayContent = content;
  if (lessonId && profile?.businessType) {
    const examples = getExamples(lessonId, profile.businessType);
    if (examples.length > 0) {
      const examplesList = examples.map(ex => `✅ ${ex}`).join('\n');
      displayContent = content.replace('{{CUSTOM_EXAMPLES}}', examplesList);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            {title}
          </DialogTitle>
          <DialogDescription>Quick learning moment</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">
            {displayContent}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};