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

    // Store new transactions and auto-categorize with AI
    let newCount = 0;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    for (const transaction of transactions) {
      // Check if transaction already exists
      const { data: existing } = await supabaseClient
        .from('bank_transactions')
        .select('id')
        .eq('transaction_id', transaction.transaction_id)
        .single();

      if (!existing) {
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
            status: 'categorized',
          })
          .select()
          .single();

        if (bankError || !bankTx) {
          console.error('Failed to insert bank transaction:', bankError);
          continue;
        }

        // Use AI to categorize transaction
        let actionType = 'expense';
        let vatRate = 20;
        let confidenceScore = 0.5;

        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: 'You are a UK tax expert helping sole traders categorize transactions. Respond only with valid JSON.'
                },
                {
                  role: 'user',
                  content: `Categorize this transaction:
Amount: £${transaction.amount}
Merchant: ${transaction.merchant_name || 'Unknown'}
Description: ${transaction.description || 'No description'}

Return JSON with:
- action: "income" | "expense" | "ignore"
- vatRate: number (0, 5, or 20)
- confidence: number (0.0-1.0)
- reasoning: string (brief explanation)

Rules:
- Positive amounts are usually income, negative are expenses
- Personal transactions (groceries, entertainment) = "ignore"
- Standard VAT rate in UK is 20%
- Some items are 0% (most food, books) or 5% (energy)
- HMRC refunds = income at 0% VAT`
                }
              ],
              tools: [
                {
                  type: 'function',
                  function: {
                    name: 'categorize_transaction',
                    description: 'Categorize a bank transaction for tax purposes',
                    parameters: {
                      type: 'object',
                      properties: {
                        action: {
                          type: 'string',
                          enum: ['income', 'expense', 'ignore'],
                          description: 'How to categorize this transaction'
                        },
                        vatRate: {
                          type: 'number',
                          enum: [0, 5, 20],
                          description: 'UK VAT rate applicable'
                        },
                        confidence: {
                          type: 'number',
                          minimum: 0,
                          maximum: 1,
                          description: 'Confidence in categorization (0-1)'
                        },
                        reasoning: {
                          type: 'string',
                          description: 'Brief explanation for the categorization'
                        }
                      },
                      required: ['action', 'vatRate', 'confidence', 'reasoning'],
                      additionalProperties: false
                    }
                  }
                }
              ],
              tool_choice: { type: 'function', function: { name: 'categorize_transaction' } }
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              const result = JSON.parse(toolCall.function.arguments);
              actionType = result.action;
              vatRate = result.vatRate;
              confidenceScore = result.confidence;
              console.log(`AI categorized ${transaction.merchant_name}: ${actionType} (${confidenceScore} confidence) - ${result.reasoning}`);
            }
          } else {
            console.error('AI categorization failed, falling back to amount-based');
            actionType = transaction.amount > 0 ? 'income' : 'expense';
          }
        } catch (aiError) {
          console.error('AI categorization error:', aiError);
          // Fallback to amount-based
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
            // Create mapping with AI confidence score
            await supabaseClient
              .from('transaction_mappings')
              .insert({
                bank_transaction_id: bankTx.id,
                income_transaction_id: incomeTx.id,
                mapping_type: 'income',
                user_confirmed: false,
                confidence_score: confidenceScore,
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
            // Create mapping with AI confidence score
            await supabaseClient
              .from('transaction_mappings')
              .insert({
                bank_transaction_id: bankTx.id,
                expense_transaction_id: expenseTx.id,
                mapping_type: 'expense',
                user_confirmed: false,
                confidence_score: confidenceScore,
              });
          }
        } else {
          // Ignore action - just create mapping with no income/expense
          await supabaseClient
            .from('transaction_mappings')
            .insert({
              bank_transaction_id: bankTx.id,
              mapping_type: 'ignored',
              user_confirmed: false,
              confidence_score: confidenceScore,
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