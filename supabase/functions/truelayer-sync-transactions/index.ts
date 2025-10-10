import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { connectionId } = await req.json();

    // Get connection details
    const { data: connection, error: connError } = await supabaseClient
      .from('truelayer_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      throw new Error('Connection not found');
    }

    // Check if token needs refresh
    let accessToken = connection.access_token;
    if (new Date(connection.expires_at) <= new Date()) {
      // Refresh token
      const tokenResponse = await fetch('https://auth.truelayer-sandbox.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: Deno.env.get('TRUELAYER_CLIENT_ID')!,
          client_secret: Deno.env.get('TRUELAYER_CLIENT_SECRET')!,
          refresh_token: connection.refresh_token,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      // Update connection
      await supabaseClient
        .from('truelayer_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        })
        .eq('id', connectionId);
    }

    // Fetch transactions from last 90 days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 90);

    const transactionsResponse = await fetch(
      `https://api.truelayer-sandbox.com/data/v1/accounts/${connection.account_id}/transactions?from=${fromDate.toISOString()}&to=${new Date().toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!transactionsResponse.ok) {
      console.error('Failed to fetch transactions');
      throw new Error('Failed to fetch transactions');
    }

    const transactionsData = await transactionsResponse.json();
    const transactions = transactionsData.results || [];

    // Fetch user's transaction rules once
    const { data: userRules } = await supabaseClient
      .from('transaction_rules')
      .select('*')
      .eq('user_id', user.id)
      .eq('enabled', true);

    // Store new transactions and auto-categorize
    let newCount = 0;
    for (const transaction of transactions) {
      // Check if transaction already exists
      const { data: existing } = await supabaseClient
        .from('bank_transactions')
        .select('id')
        .eq('transaction_id', transaction.transaction_id)
        .single();

      if (!existing) {
        // Check for matching rule first
        const merchantName = (transaction.merchant_name || transaction.description || '').toUpperCase();
        const matchedRule = userRules?.find(rule => 
          merchantName.includes(rule.merchant_pattern.toUpperCase())
        );

        // Insert bank transaction
        const { data: bankTx, error: bankError } = await supabaseClient
          .from('bank_transactions')
          .insert({
            user_id: user.id,
            connection_id: connectionId,
            transaction_id: transaction.transaction_id,
            amount: transaction.amount,
            description: transaction.description,
            timestamp: transaction.timestamp,
            merchant_name: transaction.merchant_name,
            category: transaction.transaction_category,
            status: matchedRule ? 'categorized' : 'categorized',
          })
          .select()
          .single();

        if (bankError || !bankTx) {
          console.error('Failed to insert bank transaction:', bankError);
          continue;
        }

        // Determine action and VAT rate based on rule or amount
        let actionType = 'expense';
        let vatRate = 20;

        if (matchedRule) {
          actionType = matchedRule.action;
          vatRate = matchedRule.vat_rate;
          
          // Update rule usage stats
          await supabaseClient
            .from('transaction_rules')
            .update({
              times_applied: matchedRule.times_applied + 1,
              last_applied_at: new Date().toISOString(),
            })
            .eq('id', matchedRule.id);
        } else {
          // Fallback to amount-based categorization
          actionType = transaction.amount > 0 ? 'income' : 'expense';
        }
        
        const absoluteAmount = Math.abs(transaction.amount);
        
        if (actionType === 'income') {
          // Create income transaction
          const { data: incomeTx, error: incomeError } = await supabaseClient
            .from('income_transactions')
            .insert({
              user_id: user.id,
              amount: absoluteAmount,
              description: transaction.description || transaction.merchant_name,
              transaction_date: new Date(transaction.timestamp).toISOString().split('T')[0],
              vat_rate: vatRate,
            })
            .select()
            .single();

          if (!incomeError && incomeTx) {
            // Create mapping
            await supabaseClient
              .from('transaction_mappings')
              .insert({
                bank_transaction_id: bankTx.id,
                income_transaction_id: incomeTx.id,
                mapping_type: 'income',
                user_confirmed: true,
                confidence_score: matchedRule ? 1.0 : 0.8,
              });
          }
        } else if (actionType === 'expense') {
          // Create expense transaction
          const { data: expenseTx, error: expenseError } = await supabaseClient
            .from('expense_transactions')
            .insert({
              user_id: user.id,
              amount: absoluteAmount,
              description: transaction.description || transaction.merchant_name,
              transaction_date: new Date(transaction.timestamp).toISOString().split('T')[0],
              vat_rate: vatRate,
            })
            .select()
            .single();

          if (!expenseError && expenseTx) {
            // Create mapping
            await supabaseClient
              .from('transaction_mappings')
              .insert({
                bank_transaction_id: bankTx.id,
                expense_transaction_id: expenseTx.id,
                mapping_type: 'expense',
                user_confirmed: true,
                confidence_score: matchedRule ? 1.0 : 0.8,
              });
          }
        } else {
          // Ignore action - just create mapping with no income/expense
          await supabaseClient
            .from('transaction_mappings')
            .insert({
              bank_transaction_id: bankTx.id,
              mapping_type: 'ignored',
              user_confirmed: true,
              confidence_score: 1.0,
            });
        }
        
        newCount++;
      }
    }

    // Update last sync time
    await supabaseClient
      .from('truelayer_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connectionId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        newTransactions: newCount,
        totalTransactions: transactions.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in truelayer-sync-transactions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});