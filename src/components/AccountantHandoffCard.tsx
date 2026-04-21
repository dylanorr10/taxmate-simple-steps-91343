import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Mail, FileText, Loader2, ExternalLink, Clock } from "lucide-react";
import { useHandoffPack } from "@/hooks/useHandoffPack";
import { AccountantHandoffPreview } from "@/components/AccountantHandoffPreview";
import { format } from "date-fns";

interface Props {
  /** When provided, the card uses a compact layout suitable for the Tax page. */
  compact?: boolean;
}

export function AccountantHandoffCard({ compact }: Props) {
  const [open, setOpen] = useState(false);
  const { history, isLoadingHistory } = useHandoffPack();
  const lastExport = history[0];

  return (
    <>
      <Card className={compact ? "" : "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Accountant Handoff Pack</CardTitle>
                <CardDescription className="text-xs">
                  One-click bundle that saves your accountant 5+ hours
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              <Sparkles className="w-3 h-3 mr-1" />
              New
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!compact && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Categorised transactions (Xero/QB)",
                "UK chart of accounts mapping",
                "Summary report PDF",
                "Confidence + health score",
                "Receipts bundled in folder",
                "AI-written founder profile",
              ].map((item) => (
                <div key={item} className="flex items-start gap-1.5 text-muted-foreground">
                  <FileText className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          <Button onClick={() => setOpen(true)} size="lg" className="w-full">
            <Sparkles className="w-4 h-4" />
            Generate handoff pack
          </Button>

          {lastExport && !isLoadingHistory && (
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>
                  Last: {format(new Date(lastExport.created_at), "d MMM, HH:mm")}
                  {lastExport.sent_to_email && ` → ${lastExport.sent_to_email}`}
                </span>
              </div>
              <span>Score {lastExport.health_score}/100</span>
            </div>
          )}
        </CardContent>
      </Card>

      <AccountantHandoffPreview open={open} onOpenChange={setOpen} />
    </>
  );
}

export default AccountantHandoffCard;
