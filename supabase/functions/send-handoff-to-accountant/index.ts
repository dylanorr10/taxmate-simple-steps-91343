// Email a signed download link for a previously generated handoff pack.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user }, error: userErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { exportId, email } = await req.json();
    if (!exportId || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "exportId and valid email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: row, error: rowErr } = await supabase
      .from("handoff_exports")
      .select("*")
      .eq("id", exportId)
      .eq("user_id", user.id)
      .single();
    if (rowErr || !row) {
      return new Response(JSON.stringify({ error: "Export not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fresh 24h signed URL
    const { data: signed, error: signErr } = await supabase.storage
      .from("handoff-packs")
      .createSignedUrl(row.file_path, 86400);
    if (signErr || !signed) throw signErr || new Error("Sign failed");

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name")
      .eq("id", user.id)
      .maybeSingle();
    const businessName = profile?.business_name || "Reelin user";

    // Send via Resend through Lovable connector gateway
    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#111;margin:0 0 12px;">Accountant Handoff Pack from ${businessName}</h2>
        <p style="color:#444;line-height:1.5;">
          ${businessName} has prepared an accountant-ready handoff pack for ${row.period_label}.
        </p>
        <p style="color:#444;">
          <strong>${row.transaction_count ?? 0}</strong> transactions ·
          <strong>${row.receipt_count ?? 0}</strong> receipts ·
          Book Health <strong>${row.health_score ?? "—"}/100</strong>
        </p>
        <p style="margin: 24px 0;">
          <a href="${signed.signedUrl}"
             style="background:#0070f3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
            Download bundle (.zip)
          </a>
        </p>
        <p style="color:#999;font-size:13px;">
          The link expires in 24 hours. Contains transactions CSV (Xero/QB ready),
          chart of accounts, summary PDF, confidence report, founder profile, and source receipts.
        </p>
      </div>
    `;

    const resendRes = await fetch(
      "https://connector-gateway.lovable.dev/resend/emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: "Reelin Handoff <onboarding@resend.dev>",
          to: [email],
          subject: `Accountant handoff pack — ${businessName} (${row.period_label})`,
          html,
        }),
      },
    );

    if (!resendRes.ok) {
      const txt = await resendRes.text();
      throw new Error(`Email send failed: ${txt}`);
    }

    await supabase
      .from("handoff_exports")
      .update({ sent_to_email: email, sent_at: new Date().toISOString() })
      .eq("id", exportId);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-handoff error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
