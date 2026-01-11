import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTransactionInlineProps {
  type: 'income' | 'expense';
  defaultDate?: string;
  onAdd: (data: {
    amount: number;
    description: string;
    transaction_date: string;
    vat_rate: number;
    client_name?: string;
  }) => void;
  isAdding?: boolean;
}

export const AddTransactionInline: React.FC<AddTransactionInlineProps> = ({
  type,
  defaultDate,
  onAdd,
  isAdding,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    transaction_date: defaultDate || new Date().toISOString().split('T')[0],
    vat_rate: '20',
    client_name: '',
  });

  const handleSubmit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }

    onAdd({
      amount: parseFloat(formData.amount),
      description: formData.description,
      transaction_date: formData.transaction_date,
      vat_rate: parseFloat(formData.vat_rate) || 0,
      ...(type === 'income' && formData.client_name ? { client_name: formData.client_name } : {}),
    });

    // Reset form
    setFormData({
      description: '',
      amount: '',
      transaction_date: defaultDate || new Date().toISOString().split('T')[0],
      vat_rate: '20',
      client_name: '',
    });
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setFormData({
      description: '',
      amount: '',
      transaction_date: defaultDate || new Date().toISOString().split('T')[0],
      vat_rate: '20',
      client_name: '',
    });
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "w-full border-dashed gap-2",
          type === 'income' ? "hover:border-success hover:text-success" : "hover:border-destructive hover:text-destructive"
        )}
        onClick={() => setIsExpanded(true)}
      >
        <Plus className="h-4 w-4" />
        Add {type === 'income' ? 'Income' : 'Expense'}
      </Button>
    );
  }

  return (
    <Card className={cn(
      "border-2",
      type === 'income' ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
    )}>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-sm font-medium",
            type === 'income' ? "text-success" : "text-destructive"
          )}>
            New {type === 'income' ? 'Income' : 'Expense'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={type === 'income' ? "e.g. Client payment" : "e.g. Office supplies"}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Amount (£) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="h-8 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date</label>
            <Input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">VAT Rate (%)</label>
            <Input
              type="number"
              value={formData.vat_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, vat_rate: e.target.value }))}
              placeholder="20"
              className="h-8 text-sm"
            />
          </div>
          {type === 'income' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Client Name</label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Optional"
                className="h-8 text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isAdding || !formData.amount || parseFloat(formData.amount) <= 0}
            className={cn(
              "h-7 text-xs",
              type === 'income' ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"
            )}
          >
            <Check className="h-3 w-3 mr-1" />
            {isAdding ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
