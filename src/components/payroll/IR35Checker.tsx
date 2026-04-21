import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert } from "lucide-react";

const QUESTIONS = [
  { id: "control", q: "Does your client tell you how, when and where to do the work?" },
  { id: "substitution", q: "Can you send someone else to do the work in your place?" },
  { id: "mutuality", q: "Is the client obliged to keep giving you work, and you to accept it?" },
  { id: "equipment", q: "Do you use your own equipment / tools?" },
  { id: "risk", q: "Do you carry financial risk (fix mistakes at your own cost)?" },
];

// Inside-IR35 indicators: control=yes, substitution=no, mutuality=yes, equipment=no, risk=no
const INSIDE_INDICATORS: Record<string, "yes" | "no"> = {
  control: "yes", substitution: "no", mutuality: "yes", equipment: "no", risk: "no",
};

export const IR35Checker = () => {
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});

  const insideCount = Object.entries(answers).filter(([k, v]) => INSIDE_INDICATORS[k] === v).length;
  const total = Object.keys(answers).length;
  const complete = total === QUESTIONS.length;

  let verdict: "inside" | "outside" | "borderline" | null = null;
  if (complete) {
    if (insideCount >= 4) verdict = "inside";
    else if (insideCount <= 1) verdict = "outside";
    else verdict = "borderline";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">IR35 quick check</CardTitle>
        <CardDescription>5 questions, indicative only — not legal advice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="space-y-2">
            <Label className="text-sm">{q.q}</Label>
            <RadioGroup
              value={answers[q.id] || ""}
              onValueChange={(v: "yes" | "no") => setAnswers((a) => ({ ...a, [q.id]: v }))}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                <Label htmlFor={`${q.id}-yes`} className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id={`${q.id}-no`} />
                <Label htmlFor={`${q.id}-no`} className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>
        ))}

        {verdict && (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              {verdict === "outside" ? (
                <ShieldCheck className="h-5 w-5 text-primary" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-destructive" />
              )}
              <Badge variant={verdict === "outside" ? "secondary" : "destructive"}>
                Likely {verdict === "borderline" ? "borderline" : verdict + " IR35"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {verdict === "outside" && "Looks like a genuine B2B engagement. Keep evidence (contract, invoices, your own kit)."}
              {verdict === "inside" && "This relationship looks like employment in disguise. PAYE/NI may apply."}
              {verdict === "borderline" && "Mixed signals — get a contract review or use HMRC's CEST tool."}
            </p>
          </div>
        )}

        {complete && (
          <Button variant="outline" size="sm" onClick={() => setAnswers({})}>
            Reset
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
