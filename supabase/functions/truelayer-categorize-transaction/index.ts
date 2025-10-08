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

    const { transactionId } = await req.json();

    // Get transaction details
    const { data: transaction, error: txError } = await supabaseClient
      .from('bank_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found');
    }

    // Use Lovable AI to categorize
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Analyze this bank transaction and determine if it's a business income or expense:

Amount: £${transaction.amount}
Description: ${transaction.description || 'N/A'}
Merchant: ${transaction.merchant_name || 'N/A'}
Category: ${transaction.category || 'N/A'}

Consider:
- Is this likely a business transaction?
- Is it income (money received) or expense (money spent)?
- What VAT rate applies (0%, 5%, or 20%)?
- Provide a confidence score (0-1)

Return ONLY a JSON object with:
{
  "type": "income" or "expense" or "ignored",
  "vatRate": 0 or 5 or 20,
  "confidence": 0.0 to 1.0,
  "reason": "brief explanation"
}`;

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
            content: 'You are a business accounting assistant. Analyze transactions and categorize them accurately.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('AI categorization failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const categorization = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(categorization),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in truelayer-categorize-transaction:', error);
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