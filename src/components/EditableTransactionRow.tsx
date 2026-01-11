import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';
import { Pencil, Check, X, Trash2 } from 'lucide-react';

interface EditableTransactionRowProps {
  transaction: Transaction;
  type: 'income' | 'expense';
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export const EditableTransactionRow: React.FC<EditableTransactionRowProps> = ({
  transaction,
  type,
  onUpdate,
  onDelete,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    description: transaction.description || '',
    amount: transaction.amount.toString(),
    transaction_date: transaction.transaction_date,
    vat_rate: transaction.vat_rate.toString(),
  });

  const handleSave = () => {
    const updates: Partial<Transaction> = {
      description: editValues.description,
      amount: parseFloat(editValues.amount) || 0,
      transaction_date: editValues.transaction_date,
      vat_rate: parseFloat(editValues.vat_rate) || 0,
    };
    onUpdate(transaction.id, updates);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      description: transaction.description || '',
      amount: transaction.amount.toString(),
      transaction_date: transaction.transaction_date,
      vat_rate: transaction.vat_rate.toString(),
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg border-2 border-primary/30 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Input
              value={editValues.description}
              onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Amount (£)</label>
            <Input
              type="number"
              step="0.01"
              value={editValues.amount}
              onChange={(e) => setEditValues(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date</label>
            <Input
              type="date"
              value={editValues.transaction_date}
              onChange={(e) => setEditValues(prev => ({ ...prev, transaction_date: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">VAT Rate (%)</label>
            <Input
              type="number"
              value={editValues.vat_rate}
              onChange={(e) => setEditValues(prev => ({ ...prev, vat_rate: e.target.value }))}
              placeholder="20"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
            className="h-7 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border group hover:border-primary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{transaction.description || 'Untitled'}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(transaction.transaction_date), 'd MMM yyyy')}
          {type === 'income' && transaction.client_name && ` • ${transaction.client_name}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={cn(
            "text-sm font-semibold",
            type === 'income' ? "text-success" : "text-destructive"
          )}>
            {type === 'income' ? '+' : '-'}£{Number(transaction.amount).toLocaleString()}
          </p>
          {transaction.vat_rate > 0 && (
            <p className="text-xs text-muted-foreground">{transaction.vat_rate}% VAT</p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
