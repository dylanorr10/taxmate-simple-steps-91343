import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { messages } = await req.json() as { messages: Message[] };

    // Get user context for personalized advice
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, business_type, vat_registered, vat_number")
      .eq("id", user.id)
      .single();

    const { data: income } = await supabase
      .from("income_transactions")
      .select("amount, transaction_date")
      .eq("user_id", user.id)
      .gte("transaction_date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const { data: expenses } = await supabase
      .from("expense_transactions")
      .select("amount, transaction_date")
      .eq("user_id", user.id)
      .gte("transaction_date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const totalIncome = income?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const profit = totalIncome - totalExpenses;

    const systemPrompt = `You are a friendly and knowledgeable financial advisor specializing in UK sole trader finances and tax compliance.

User Context:
- Business: ${profile?.business_name || "Not specified"}
- Business Type: ${profile?.business_type || "Not specified"}
- VAT Registered: ${profile?.vat_registered ? `Yes (${profile.vat_number})` : "No"}
- Last 90 days: Income £${totalIncome.toFixed(2)}, Expenses £${totalExpenses.toFixed(2)}, Profit £${profit.toFixed(2)}

Your role:
1. Provide clear, actionable advice specific to UK tax rules and HMRC regulations
2. Reference the user's actual financial data when relevant
3. Explain complex tax concepts in simple terms
4. Suggest practical next steps
5. Be encouraging and supportive
6. Always cite UK-specific rules (e.g., VAT thresholds, Making Tax Digital, Self Assessment deadlines)

Guidelines:
- Keep responses concise (under 200 words unless asked for detail)
- Use bullet points for clarity
- Provide specific numbers and dates when discussing deadlines
- If asked about something requiring professional advice, acknowledge limits and suggest consulting an accountant
- Focus on practical, immediate actions the user can take`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires payment. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("AI service error");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Chat assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
