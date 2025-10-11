import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dailyTips, DailyTip } from '@/data/dailyTips';
import { useIncomeTransactions, useExpenseTransactions } from './useTransactions';
import { useTransactionRules } from './useTransactionRules';
import { getMonthToDateTotal } from '@/utils/transactionHelpers';

export const useDailyTip = () => {
  const [todaysTip, setTodaysTip] = useState<DailyTip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);

  const { transactions: incomeTransactions } = useIncomeTransactions();
  const { transactions: expenseTransactions } = useExpenseTransactions();
  const { rules } = useTransactionRules();

  useEffect(() => {
    const checkAndShowTip = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Variable ratio: Show 1-3 tips per day at random intervals
        const today = new Date().toISOString().split('T')[0];
        const { data: tipsShownToday, error } = await supabase
          .from('daily_tips_shown')
          .select('*')
          .eq('user_id', user.id)
          .gte('shown_at', `${today}T00:00:00`);

        if (error) throw error;

        // Random number of tips per day (1-3)
        const maxTipsPerDay = Math.floor(Math.random() * 3) + 1;
        const tipsShownCount = tipsShownToday?.length || 0;

        if (tipsShownCount >= maxTipsPerDay) {
          setIsLoading(false);
          return;
        }

        // Wait random interval before showing (immediate to 4 hours)
        const randomDelay = Math.random() * 4 * 60 * 60 * 1000; // 0-4 hours in ms
        const shouldShowImmediately = Math.random() > 0.7; // 30% chance to show immediately

        if (!shouldShowImmediately) {
          setTimeout(() => {
            checkAndShowTip();
          }, randomDelay);
          setIsLoading(false);
          return;
        }

        // Determine if this is a bonus, easter egg, or regular tip
        const random = Math.random();
        let tipPool: DailyTip[] = [];

        if (random < 0.05) {
          // 5% chance for easter egg (1 in 20)
          tipPool = dailyTips.filter(t => t.isEasterEgg);
        } else if (random < 0.15) {
          // 10% chance for bonus tip
          tipPool = dailyTips.filter(t => t.isBonus);
        } else if (random < 0.25) {
          // 10% chance for pro tip
          tipPool = dailyTips.filter(t => t.isPro);
        } else {
          // 75% chance for regular tips
          tipPool = dailyTips.filter(t => !t.isBonus && !t.isEasterEgg && !t.isPro);
        }

        // Calculate context for smart tip selection
        const incomeThisMonth = getMonthToDateTotal(incomeTransactions);
        const expensesThisMonth = getMonthToDateTotal(expenseTransactions);
        const profit = incomeThisMonth - expensesThisMonth;
        const expenseCount = expenseTransactions.length;
        const ruleCount = rules.length;

        // Select appropriate tip based on triggers
        let selectedTip: DailyTip | null = null;

        // Try to find triggered tip in the selected pool
        for (const tip of tipPool) {
          if (!tip.trigger) continue;

          switch (tip.trigger.type) {
            case 'expense_count':
              if (expenseCount >= (tip.trigger.condition || 0)) {
                selectedTip = tip;
              }
              break;
            case 'profit_threshold':
              if (profit >= (tip.trigger.condition || 0)) {
                selectedTip = tip;
              }
              break;
            case 'no_rules':
              if (ruleCount === 0) {
                selectedTip = tip;
              }
              break;
          }

          if (selectedTip) break;
        }

        // If no triggered tip, pick a random one from the pool
        if (!selectedTip && tipPool.length > 0) {
          selectedTip = tipPool[Math.floor(Math.random() * tipPool.length)];
        }

        if (selectedTip) {
          setTodaysTip(selectedTip);
          setShouldShow(true);

          // Record that tip was shown
          await supabase.from('daily_tips_shown').insert({
            user_id: user.id,
            tip_id: selectedTip.id,
          });
        }
      } catch (error) {
        console.error('Error loading daily tip:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndShowTip();
  }, [incomeTransactions, expenseTransactions, rules]);

  const dismissTip = async () => {
    if (!todaysTip) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('daily_tips_shown')
        .update({ dismissed: true })
        .eq('user_id', user.id)
        .eq('tip_id', todaysTip.id);

      setShouldShow(false);
    } catch (error) {
      console.error('Error dismissing tip:', error);
    }
  };

  const markLessonOpened = async () => {
    if (!todaysTip) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('daily_tips_shown')
        .update({ opened_full_lesson: true })
        .eq('user_id', user.id)
        .eq('tip_id', todaysTip.id);
    } catch (error) {
      console.error('Error marking lesson opened:', error);
    }
  };

  return {
    todaysTip,
    isLoading,
    shouldShow,
    dismissTip,
    markLessonOpened,
  };
};