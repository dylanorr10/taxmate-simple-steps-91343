import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, Plus, Target, ShoppingCart, Tag, EyeOff, Edit2, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useTransactionRules } from "@/hooks/useTransactionRules";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Rules = () => {
  const { rules, isLoading, createRule, isCreating, updateRule, deleteRule, toggleRule } = useTransactionRules();
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  
  const [newRule, setNewRule] = useState({
    merchant_pattern: "",
    action: "expense" as 'income' | 'expense' | 'ignore',
    vat_rate: 20,
    enabled: true,
  });

  const handleCreateRule = () => {
    if (!newRule.merchant_pattern) return;
    createRule(newRule);
    setNewRule({
      merchant_pattern: "",
      action: "expense",
      vat_rate: 20,
      enabled: true,
    });
    setIsAddingRule(false);
  };

  const handleUpdateRule = (id: string, updates: Partial<typeof newRule>) => {
    updateRule({ id, ...updates });
    setEditingRule(null);
  };

  const incomeRules = rules.filter(r => r.action === 'income');
  const expenseRules = rules.filter(r => r.action === 'expense');
  const ignoredRules = rules.filter(r => r.action === 'ignore');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Transaction Rules
            </h1>
            <p className="text-muted-foreground mt-1">
              Automatically categorize recurring transactions
            </p>
          </div>
          <Dialog open={isAddingRule} onOpenChange={setIsAddingRule}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Rule</DialogTitle>
                <DialogDescription>
                  Define how transactions from a specific merchant should be categorized
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Merchant Name Pattern</Label>
                  <Input
                    placeholder="e.g., NETFLIX, AMAZON, ADOBE"
                    value={newRule.merchant_pattern}
                    onChange={(e) => setNewRule({ ...newRule, merchant_pattern: e.target.value.toUpperCase() })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Will match any transaction containing this text
                  </p>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(value: 'income' | 'expense' | 'ignore') => setNewRule({ ...newRule, action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Categorize as Income</SelectItem>
                      <SelectItem value="expense">Categorize as Expense</SelectItem>
                      <SelectItem value="ignore">Ignore (Personal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newRule.action !== 'ignore' && (
                  <div>
                    <Label>VAT Rate (%)</Label>
                    <Select
                      value={String(newRule.vat_rate)}
                      onValueChange={(value) => setNewRule({ ...newRule, vat_rate: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% VAT</SelectItem>
                        <SelectItem value="5">5% VAT</SelectItem>
                        <SelectItem value="20">20% VAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingRule(false)}>Cancel</Button>
                <Button onClick={handleCreateRule} disabled={isCreating || !newRule.merchant_pattern}>
                  {isCreating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : 'Create Rule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {/* Income Rules */}
              <Card className="p-4 border-success/20 bg-success/5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-success" />
                  Income Rules ({incomeRules.length})
                </h3>
                <div className="space-y-2">
                  {incomeRules.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No income rules yet</p>
                  ) : (
                    incomeRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium">{rule.merchant_pattern}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.vat_rate}% VAT • Applied {rule.times_applied} times
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => toggleRule({ id: rule.id, enabled })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Expense Rules */}
              <Card className="p-4 border-warning/20 bg-warning/5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-warning" />
                  Expense Rules ({expenseRules.length})
                </h3>
                <div className="space-y-2">
                  {expenseRules.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No expense rules yet</p>
                  ) : (
                    expenseRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium">{rule.merchant_pattern}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.vat_rate}% VAT • Applied {rule.times_applied} times
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => toggleRule({ id: rule.id, enabled })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Ignored Rules */}
              <Card className="p-4 border-muted bg-muted/5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                  Ignored (Personal) ({ignoredRules.length})
                </h3>
                <div className="space-y-2">
                  {ignoredRules.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No ignored rules yet</p>
                  ) : (
                    ignoredRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium">{rule.merchant_pattern}</div>
                          <div className="text-sm text-muted-foreground">
                            Applied {rule.times_applied} times
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => toggleRule({ id: rule.id, enabled })}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </ScrollArea>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Rules;