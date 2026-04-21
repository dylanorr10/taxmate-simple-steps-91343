// Email a handoff pack download link to an accountant via Resend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  exportId: string;
  accountantEmail: string;
  accountantName?: string;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: Body = await req.json();
    if (!body.exportId || !body.accountantEmail) {
      return new Response(JSON.stringify({ error: "exportId and accountantEmail required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.accountantEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: exp, error: expErr } = await admin
      .from("handoff_exports")
      .select("*")
      .eq("id", body.exportId)
      .eq("user_id", user.id)
      .single();

    if (expErr || !exp) {
      return new Response(JSON.stringify({ error: "Handoff pack not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate fresh signed URL (24h)
    const { data: signed } = await admin.storage
      .from("handoff-packs")
      .createSignedUrl(exp.file_path, 24 * 60 * 60);

    if (!signed?.signedUrl) throw new Error("Could not generate download link");

    // Get business name
    const { data: profile } = await admin.from("profiles").select("business_name").eq("id", user.id).maybeSingle();
    const bizName = profile?.business_name || "Your client";

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reelin <onboarding@resend.dev>",
        to: [body.accountantEmail],
        subject: `${bizName} — Accountant handoff pack ready`,
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
            <h2>${bizName} has shared their books with you</h2>
            ${body.accountantName ? `<p>Hi ${body.accountantName},</p>` : ""}
            <p>Your client has prepared a complete accounting handoff pack via <strong>Reelin</strong>. It contains everything you need to get started:</p>
            <ul>
              <li>Categorised transactions (Xero / QuickBooks compatible CSV)</li>
              <li>Standard UK chart of accounts mapping</li>
              <li>Summary PDF with revenue, expenses, VAT status</li>
              <li>Confidence report with Book Health Score</li>
              <li>Receipts and source documents</li>
            </ul>
            ${body.message ? `<p style="background:#f5f5f5;padding:12px;border-radius:6px;"><em>${body.message.replace(/[<>]/g, "")}</em></p>` : ""}
            <p style="margin: 24px 0;">
              <a href="${signed.signedUrl}" style="background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Download handoff pack
              </a>
            </p>
            <p style="color: #666; font-size: 13px;">This link expires in 24 hours. ${exp.transaction_count} transactions, ${exp.receipt_count} receipts, Book Health Score ${exp.health_score}/100.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
            <p style="color: #999; font-size: 12px;">Sent via Reelin — accountant handoff for UK founders.</p>
          </div>
        `,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend error:", resp.status, errText);
      throw new Error(`Email send failed: ${resp.status}`);
    }

    await admin.from("handoff_exports").update({
      sent_to_email: body.accountantEmail,
      sent_at: new Date().toISOString(),
    }).eq("id", body.exportId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send handoff error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
