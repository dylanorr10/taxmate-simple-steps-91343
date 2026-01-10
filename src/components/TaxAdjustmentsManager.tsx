import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Calculator,
  Building2,
  Car,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTaxAdjustments, ADJUSTMENT_CATEGORIES, AddAdjustmentInput } from "@/hooks/useTaxAdjustments";
import { formatCurrency } from "@/utils/transactionHelpers";

const ADJUSTMENT_TYPE_INFO = {
  capital_allowance: {
    icon: Building2,
    label: 'Capital Allowances',
    description: 'Tax relief on qualifying capital expenditure',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  accrual: {
    icon: FileText,
    label: 'Accruals',
    description: 'Income/expenses earned but not received/paid',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  prepayment: {
    icon: FileText,
    label: 'Prepayments',
    description: 'Income/expenses received/paid in advance',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-500/10',
  },
  depreciation: {
    icon: TrendingDown,
    label: 'Depreciation',
    description: 'Add back accounting depreciation (not tax-deductible)',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/10',
  },
  private_use: {
    icon: Car,
    label: 'Private Use',
    description: 'Add back non-business portion of expenses',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  disallowable: {
    icon: AlertTriangle,
    label: 'Disallowable Expenses',
    description: 'Expenses not allowed for tax purposes',
    color: 'text-red-600',
    bgColor: 'bg-red-500/10',
  },
  other: {
    icon: Calculator,
    label: 'Other Adjustments',
    description: 'Any other tax adjustments',
    color: 'text-gray-600',
    bgColor: 'bg-gray-500/10',
  },
};

export const TaxAdjustmentsManager: React.FC = () => {
  const {
    adjustments,
    isLoading,
    addAdjustment,
    isAdding,
    deleteAdjustment,
    isDeleting,
    totals,
    netAdjustment,
    currentTaxYear,
  } = useTaxAdjustments();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AddAdjustmentInput>({
    adjustment_type: 'capital_allowance',
    category: '',
    description: '',
    amount: 0,
    is_addition: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAdjustment(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          adjustment_type: 'capital_allowance',
          category: '',
          description: '',
          amount: 0,
          is_addition: false,
        });
      },
    });
  };

  const categories = ADJUSTMENT_CATEGORIES[formData.adjustment_type] || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Additions to Profit</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.additions)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Increases taxable profit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Deductions from Profit</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.deductions)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Reduces taxable profit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Calculator className="h-4 w-4" />
              <span className="text-sm font-medium">Net Adjustment</span>
            </div>
            <p className={`text-2xl font-bold ${netAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {netAdjustment >= 0 ? '+' : ''}{formatCurrency(netAdjustment)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {netAdjustment >= 0 ? 'Increases' : 'Decreases'} taxable profit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Adjustments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Tax Adjustments {currentTaxYear}/{currentTaxYear + 1}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Tax Adjustment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Adjustment Type</Label>
                  <Select
                    value={formData.adjustment_type}
                    onValueChange={(value: any) => setFormData({ ...formData, adjustment_type: value, category: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ADJUSTMENT_TYPE_INFO).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <info.icon className={`h-4 w-4 ${info.color}`} />
                            {info.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {ADJUSTMENT_TYPE_INFO[formData.adjustment_type]?.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Laptop for business use"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Addition to Profit?</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.is_addition 
                        ? 'This will increase your taxable profit' 
                        : 'This will reduce your taxable profit'}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_addition}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_addition: checked })}
                  />
                </div>

                {formData.adjustment_type === 'capital_allowance' && (
                  <>
                    <div className="space-y-2">
                      <Label>Asset Name (optional)</Label>
                      <Input
                        value={formData.asset_name || ''}
                        onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                        placeholder="e.g., MacBook Pro 16"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Asset Value (£)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.asset_value || ''}
                          onChange={(e) => setFormData({ ...formData, asset_value: parseFloat(e.target.value) || undefined })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Purchase Date</Label>
                        <Input
                          type="date"
                          value={formData.asset_date || ''}
                          onChange={(e) => setFormData({ ...formData, asset_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isAdding}>
                  {isAdding ? 'Adding...' : 'Add Adjustment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {adjustments.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tax adjustments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add capital allowances, accruals, and other year-end adjustments
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Effect</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adj) => {
                    const typeInfo = ADJUSTMENT_TYPE_INFO[adj.adjustment_type];
                    const Icon = typeInfo.icon;
                    return (
                      <TableRow key={adj.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${typeInfo.bgColor}`}>
                              <Icon className={`h-4 w-4 ${typeInfo.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{typeInfo.label}</p>
                              <p className="text-xs text-muted-foreground">{adj.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{adj.description}</p>
                          {adj.asset_name && (
                            <p className="text-xs text-muted-foreground">Asset: {adj.asset_name}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(adj.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={adj.is_addition 
                              ? 'bg-red-500/10 text-red-600 border-red-500/30' 
                              : 'bg-green-500/10 text-green-600 border-green-500/30'
                            }
                          >
                            {adj.is_addition ? 'Add' : 'Deduct'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteAdjustment(adj.id)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete adjustment</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Common Adjustments Guide */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Common Year-End Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Deductions (Reduce Tax)</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Capital allowances on equipment</li>
                <li>• Accrued expenses at year end</li>
                <li>• Prepaid income adjustments</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Additions (Increase Tax)</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Depreciation (add back)</li>
                <li>• Private use adjustments</li>
                <li>• Disallowable expenses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
