import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Package, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useHandoffHistory } from "@/hooks/useHandoffPack";
import AccountantHandoffPreview from "./AccountantHandoffPreview";
import { formatDistanceToNow } from "date-fns";

const AccountantHandoffCard = () => {
  const [open, setOpen] = useState(false);
  const { data: history = [] } = useHandoffHistory();

  const latest = history[0];

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Accountant Handoff Pack</CardTitle>
                <CardDescription className="text-xs">
                  One-click bundle that turns 5 hours of accountant onboarding into 30 minutes.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              <Package className="w-3 h-3 mr-1" />
              Xero / QB ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              "Transactions CSV",
              "Chart of accounts",
              "Summary PDF",
              "Confidence report",
              "Founder profile",
              "Source receipts",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <Button onClick={() => setOpen(true)} size="lg" className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate handoff pack
          </Button>

          {latest && (
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Last export
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground">{latest.period_label}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}
                  </span>
                </div>
                {latest.sent_to_email && (
                  <Badge variant="secondary" className="text-xs">
                    Sent to {latest.sent_to_email}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AccountantHandoffPreview open={open} onOpenChange={setOpen} />
    </>
  );
};

export default AccountantHandoffCard;
