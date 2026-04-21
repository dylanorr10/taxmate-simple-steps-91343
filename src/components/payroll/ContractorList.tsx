import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { usePayrollPeople, usePayrollRuns } from "@/hooks/usePayroll";
import { formatGBP } from "@/lib/payrollCalculations";
import { Plus, Trash2, Briefcase } from "lucide-react";

export const ContractorList = () => {
  const { contractors, add, remove } = usePayrollPeople();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [utr, setUtr] = useState("");
  const [ir35, setIR35] = useState<"inside" | "outside" | "unknown">("unknown");

  const handleAdd = () => {
    if (!name) return;
    add({
      person_type: "contractor",
      name,
      email: email || null,
      annual_salary: 0,
      monthly_salary: 0,
      ni_category: null,
      ir35_status: ir35,
      utr: utr || null,
      start_date: new Date().toISOString().split("T")[0],
      active: true,
      notes: null,
    });
    setName(""); setEmail(""); setUtr(""); setIR35("unknown");
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Contractors</h2>
          <p className="text-sm text-muted-foreground">Track payments and IR35 status.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add contractor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email (optional)</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-2">
                <Label>UTR (optional)</Label>
                <Input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="10-digit reference" />
              </div>
              <div className="space-y-2">
                <Label>IR35 status</Label>
                <Select value={ir35} onValueChange={(v: "inside" | "outside" | "unknown") => setIR35(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outside">Outside IR35</SelectItem>
                    <SelectItem value="inside">Inside IR35</SelectItem>
                    <SelectItem value="unknown">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Add contractor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {contractors.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No contractors yet. Add one to start tracking payments.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {contractors.map((c) => (
            <ContractorCard key={c.id} id={c.id} name={c.name} email={c.email} ir35={c.ir35_status} onDelete={() => remove(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

const ContractorCard = ({ id, name, email, ir35, onDelete }: {
  id: string; name: string; email: string | null; ir35: string | null; onDelete: () => void;
}) => {
  const { runs } = usePayrollRuns(id);
  const total = runs.reduce((s, r) => s + Number(r.gross), 0);

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{email || "No email"}</div>
          <div className="flex gap-2 items-center">
            <Badge variant={ir35 === "outside" ? "secondary" : ir35 === "inside" ? "destructive" : "outline"}>
              {ir35 === "outside" ? "Outside IR35" : ir35 === "inside" ? "Inside IR35" : "IR35: unknown"}
            </Badge>
            <span className="text-xs text-muted-foreground">Paid YTD: {formatGBP(total)}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
