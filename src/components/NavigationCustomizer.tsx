import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { availableNavItems, getDefaultNavItems } from '@/data/navigationConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';

const NavigationCustomizer = () => {
  const { profile, updateNavItems, isUpdatingNav } = useProfile();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setSelectedItems(
        profile.nav_items || 
        getDefaultNavItems(profile.business_type || undefined, profile.experience_level || undefined)
      );
    }
  }, [profile]);

  const handleToggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      // Remove item if it's already selected
      if (selectedItems.length > 2) {
        setSelectedItems(selectedItems.filter(id => id !== itemId));
      } else {
        toast.error("You need at least 2 navigation items");
      }
    } else {
      // Add item if we have less than 4
      if (selectedItems.length < 4) {
        setSelectedItems([...selectedItems, itemId]);
      } else {
        toast.error("Maximum 4 navigation items allowed");
      }
    }
  };

  const handleSave = () => {
    if (selectedItems.length < 2) {
      toast.error("Please select at least 2 navigation items");
      return;
    }
    updateNavItems(selectedItems);
  };

  const handleReset = () => {
    const defaults = getDefaultNavItems(
      profile?.business_type || undefined, 
      profile?.experience_level || undefined
    );
    setSelectedItems(defaults);
  };

  const isRecommended = (itemId: string) => {
    const item = availableNavItems.find(i => i.id === itemId);
    if (!item) return false;
    
    return item.recommendedFor.includes('all') || 
           item.recommendedFor.includes(profile?.business_type || '') ||
           item.recommendedFor.includes(profile?.experience_level || '');
  };

  return (
    <div className="space-y-6">
      {/* Current Selection */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Your Navigation ({selectedItems.length}/4 items)
        </h3>
        <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[80px]">
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items selected</p>
          ) : (
            selectedItems.map(itemId => {
              const item = availableNavItems.find(i => i.id === itemId);
              if (!item) return null;
              const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;
              
              return (
                <Badge 
                  key={item.id}
                  variant="secondary" 
                  className="px-3 py-2 gap-2 cursor-pointer hover:bg-destructive/10 transition-colors"
                  onClick={() => handleToggleItem(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Badge>
              );
            })
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tap an item to remove it from your navigation
        </p>
      </div>

      {/* Available Items */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Available Items
        </h3>
        <div className="space-y-2">
          {availableNavItems
            .filter(item => !selectedItems.includes(item.id))
            .map(item => {
              const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;
              const recommended = isRecommended(item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleItem(item.id)}
                  disabled={selectedItems.length >= 4}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      {recommended && (
                        <Badge variant="outline" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isUpdatingNav}
          className="flex-1"
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={isUpdatingNav || selectedItems.length < 2}
          className="flex-1"
        >
          {isUpdatingNav ? "Saving..." : "Save Navigation"}
        </Button>
      </div>
    </div>
  );
};

export default NavigationCustomizer;
