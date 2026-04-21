// Generate Accountant Handoff Pack — server-side ZIP bundle
// Produces: transactions CSV, chart of accounts CSV, summary PDF, confidence
// PDF, founder profile (AI), README, and source receipts.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import JSZip from "https://esm.sh/jszip@3.10.1";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface ReqBody {
  periodLabel: string;
  periodStart?: string;
  periodEnd?: string;
}

// Same CoA mapping as src/lib/chartOfAccounts.ts (kept in-sync manually)
const HMRC_TO_COA: Record<string, { code: string; name: string }> = {
  turnover: { code: "200", name: "Sales" },
  sales: { code: "200", name: "Sales" },
  other_income: { code: "260", name: "Other Revenue" },
  cost_of_goods: { code: "310", name: "Cost of Goods Sold" },
  goods_bought_for_resale: { code: "310", name: "Cost of Goods Sold" },
  advertising: { code: "400", name: "Advertising & Marketing" },
  marketing: { code: "400", name: "Advertising & Marketing" },
  bank_charges: { code: "404", name: "Bank Fees" },
  accountancy_fees: { code: "412", name: "Consulting & Accountancy" },
  legal_fees: { code: "441", name: "Legal Expenses" },
  professional_fees: { code: "412", name: "Consulting & Accountancy" },
  entertainment: { code: "420", name: "Entertainment" },
  insurance: { code: "433", name: "Insurance" },
  utilities: { code: "445", name: "Light, Power, Heating" },
  motor_expenses: { code: "449", name: "Motor Vehicle Expenses" },
  vehicle: { code: "449", name: "Motor Vehicle Expenses" },
  office_costs: { code: "453", name: "Office Expenses" },
  office_supplies: { code: "453", name: "Office Expenses" },
  rent: { code: "469", name: "Rent" },
  premises: { code: "469", name: "Rent" },
  repairs: { code: "473", name: "Repairs & Maintenance" },
  wages: { code: "477", name: "Wages & Salaries" },
  staff_costs: { code: "477", name: "Wages & Salaries" },
  subcontractors: { code: "478", name: "Subcontractors" },
  software: { code: "485", name: "Software Subscriptions" },
  subscriptions: { code: "485", name: "Software Subscriptions" },
  it_costs: { code: "485", name: "Software Subscriptions" },
  phone: { code: "489", name: "Telephone & Internet" },
  telephone: { code: "489", name: "Telephone & Internet" },
  travel: { code: "493", name: "Travel - National" },
  travel_uk: { code: "493", name: "Travel - National" },
  travel_overseas: { code: "494", name: "Travel - International" },
  home_office: { code: "499", name: "Home Office" },
  use_of_home: { code: "499", name: "Home Office" },
};

const CHART_OF_ACCOUNTS_CSV = `Code,Name,Type
200,Sales,Revenue
260,Other Revenue,Revenue
310,Cost of Goods Sold,Direct Costs
400,Advertising & Marketing,Expense
404,Bank Fees,Expense
408,General Expenses,Expense
412,Consulting & Accountancy,Expense
420,Entertainment,Expense
433,Insurance,Expense
441,Legal Expenses,Expense
445,Light/Power/Heating,Expense
449,Motor Vehicle Expenses,Expense
453,Office Expenses,Expense
463,Printing & Stationery,Expense
469,Rent,Expense
473,Repairs & Maintenance,Expense
477,Wages & Salaries,Expense
478,Subcontractors,Expense
485,Software Subscriptions,Expense
489,Telephone & Internet,Expense
493,Travel - National,Expense
494,Travel - International,Expense
497,Bank Charges,Expense
499,Home Office,Expense
999,REVIEW NEEDED - Uncategorised,Expense`;

function mapToCoA(code: string | null, type: "income" | "expense") {
  if (!code) {
    return type === "income"
      ? { code: "200", name: "Sales" }
      : { code: "999", name: "REVIEW NEEDED - Uncategorised" };
  }
  const k = code.toLowerCase().replace(/[^a-z_]/g, "_");
  return (
    HMRC_TO_COA[k] ||
    (type === "income"
      ? { code: "260", name: "Other Revenue" }
      : { code: "408", name: "General Expenses" })
  );
}

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildTransactionsCsv(income: any[], expenses: any[]): string {
  const header = [
    "Date",
    "Description",
    "Reference",
    "Amount",
    "Currency",
    "Account Code",
    "Account Name",
    "Tax Type",
    "Tax Amount",
    "Contact",
    "Notes",
    "Receipt Link",
  ].join(",");

  const incomeRows = income.map((t) => {
    const coa = mapToCoA(t.hmrc_category_id, "income");
    const taxAmount = t.amount * ((t.vat_rate || 0) / (100 + (t.vat_rate || 0)));
    return [
      t.transaction_date,
      csvEscape(t.description ?? ""),
      csvEscape(t.invoice_number ?? ""),
      t.amount.toFixed(2),
      "GBP",
      coa.code,
      csvEscape(coa.name),
      t.vat_rate ? `${t.vat_rate}% (VAT on Income)` : "No VAT",
      taxAmount ? taxAmount.toFixed(2) : "0.00",
      csvEscape(t.client_name ?? ""),
      "",
      "",
    ].join(",");
  });

  const expenseRows = expenses.map((t) => {
    const coa = mapToCoA(t.hmrc_category_id, "expense");
    const taxAmount = t.amount * ((t.vat_rate || 0) / (100 + (t.vat_rate || 0)));
    const receiptLink = t.receipt_url ? `6-source-documents/receipt-${t.id}` : "";
    return [
      t.transaction_date,
      csvEscape(t.description ?? ""),
      "",
      `-${t.amount.toFixed(2)}`,
      "GBP",
      coa.code,
      csvEscape(coa.name),
      t.vat_rate ? `${t.vat_rate}% (VAT on Expenses)` : "No VAT",
      taxAmount ? taxAmount.toFixed(2) : "0.00",
      "",
      csvEscape(t.disallowable_reason ?? ""),
      receiptLink,
    ].join(",");
  });

  const all = [...incomeRows, ...expenseRows].sort();
  return [header, ...all].join("\n");
}

function buildSummaryPdf(args: {
  businessName: string;
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  txCount: number;
  healthScore: number;
  vatRegistered: boolean;
  expenseByCategory: Array<{ name: string; amount: number; pct: number }>;
  topClients: Array<{ name: string; amount: number }>;
  edgeCases: string[];
}): Uint8Array {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Accountant Handoff Summary", 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(120);
  doc.text(`${args.businessName} — ${args.periodLabel}`, 20, y);
  y += 6;
  doc.text(`Prepared ${new Date().toLocaleDateString("en-GB")}`, 20, y);
  y += 10;
  doc.setTextColor(0);

  // Headline numbers
  doc.setFontSize(13);
  doc.text("Headline", 20, y);
  y += 7;
  doc.setFontSize(11);
  doc.text(`Total income: £${args.totalIncome.toFixed(2)}`, 25, y);
  y += 6;
  doc.text(`Total expenses: £${args.totalExpenses.toFixed(2)}`, 25, y);
  y += 6;
  doc.text(`Net profit: £${(args.totalIncome - args.totalExpenses).toFixed(2)}`, 25, y);
  y += 6;
  doc.text(`Transactions: ${args.txCount}`, 25, y);
  y += 6;
  doc.text(`Book Health Score: ${args.healthScore}/100`, 25, y);
  y += 6;
  doc.text(`VAT registered: ${args.vatRegistered ? "Yes" : "No"}`, 25, y);
  y += 12;

  // Expense breakdown
  doc.setFontSize(13);
  doc.text("Expense breakdown", 20, y);
  y += 7;
  doc.setFontSize(10);
  args.expenseByCategory.slice(0, 12).forEach((c) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      `${c.name}: £${c.amount.toFixed(2)} (${c.pct.toFixed(1)}%)`,
      25,
      y,
    );
    y += 5;
  });
  y += 6;

  // Top clients
  if (args.topClients.length) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.text("Top clients", 20, y);
    y += 7;
    doc.setFontSize(10);
    args.topClients.forEach((c) => {
      doc.text(`${c.name}: £${c.amount.toFixed(2)}`, 25, y);
      y += 5;
    });
    y += 6;
  }

  // Edge cases
  if (args.edgeCases.length) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.text("Notes for accountant", 20, y);
    y += 7;
    doc.setFontSize(10);
    args.edgeCases.forEach((e) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`• ${e}`, 165);
      doc.text(lines, 25, y);
      y += lines.length * 5;
    });
  }

  return new Uint8Array(doc.output("arraybuffer"));
}

function buildConfidencePdf(args: {
  healthScore: number;
  userConfirmedPct: number;
  txCount: number;
  receiptsPct: number;
  uncategorisedCount: number;
}): Uint8Array {
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(18);
  doc.text("Confidence Report", 20, y);
  y += 12;
  doc.setFontSize(12);
  doc.text(`Overall Book Health: ${args.healthScore}/100`, 20, y);
  y += 8;
  doc.text(`Transactions in pack: ${args.txCount}`, 20, y);
  y += 8;
  doc.text(`User-confirmed mappings: ${args.userConfirmedPct.toFixed(0)}%`, 20, y);
  y += 8;
  doc.text(`Expenses with receipts: ${args.receiptsPct.toFixed(0)}%`, 20, y);
  y += 8;
  doc.text(`Uncategorised items: ${args.uncategorisedCount}`, 20, y);
  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    "Items in account 999 require manual review before filing.",
    20,
    y,
  );
  return new Uint8Array(doc.output("arraybuffer"));
}

async function generateFounderProfile(profile: any, topExpenses: string[]): Promise<string> {
  if (!LOVABLE_API_KEY) {
    return `${profile?.business_name || "This business"} — ${profile?.business_type || "solo founder"}. ${profile?.vat_registered ? "VAT registered." : "Not VAT registered."} Accounting basis: ${profile?.accounting_basis || "cash"}.`;
  }
  const sys = "You write a single concise paragraph (3-4 sentences) describing a UK small business for an accountant. Plain professional tone. No marketing fluff. No bullet points.";
  const userPrompt = `Business: ${profile?.business_name || "Unnamed"}
Type: ${profile?.business_type || "solo founder"}
VAT registered: ${profile?.vat_registered ? "yes" : "no"}
Accounting basis: ${profile?.accounting_basis || "cash"}
Top expense categories: ${topExpenses.slice(0, 5).join(", ") || "n/a"}

Write the profile paragraph.`;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI gateway ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "Profile unavailable.";
  } catch (err) {
    console.error("Founder profile AI failed:", err);
    return `${profile?.business_name || "This business"}. AI profile unavailable.`;
  }
}

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

    const body = (await req.json()) as ReqBody;
    const { periodLabel, periodStart, periodEnd } = body;
    if (!periodLabel) {
      return new Response(JSON.stringify({ error: "periodLabel required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit: 5 per day
    const since = new Date(Date.now() - 86400_000).toISOString();
    const { count: recentCount } = await supabase
      .from("handoff_exports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((recentCount ?? 0) >= 5) {
      return new Response(
        JSON.stringify({ error: "Daily limit reached (5 packs/day)" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch data
    let incomeQ = supabase.from("income_transactions").select("*, hmrc_categories(code,display_name)").eq("user_id", user.id);
    let expenseQ = supabase.from("expense_transactions").select("*, hmrc_categories(code,display_name)").eq("user_id", user.id);
    if (periodStart) {
      incomeQ = incomeQ.gte("transaction_date", periodStart);
      expenseQ = expenseQ.gte("transaction_date", periodStart);
    }
    if (periodEnd) {
      incomeQ = incomeQ.lte("transaction_date", periodEnd);
      expenseQ = expenseQ.lte("transaction_date", periodEnd);
    }

    const [{ data: income = [] }, { data: expenses = [] }, { data: profile }, { data: mappings = [] }] = await Promise.all([
      incomeQ,
      expenseQ,
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("transaction_mappings").select("user_confirmed").eq("bank_transaction_id", user.id).limit(1000),
    ]);

    // Normalise hmrc category code from join
    const normIncome = (income || []).map((t: any) => ({
      ...t,
      hmrc_category_id: t.hmrc_categories?.code || t.hmrc_category_id,
    }));
    const normExpenses = (expenses || []).map((t: any) => ({
      ...t,
      hmrc_category_id: t.hmrc_categories?.code || t.hmrc_category_id,
    }));

    const totalIncome = normIncome.reduce((s, t) => s + Number(t.amount || 0), 0);
    const totalExpenses = normExpenses.reduce((s, t) => s + Number(t.amount || 0), 0);
    const txCount = normIncome.length + normExpenses.length;
    const receiptCount = normExpenses.filter((e) => !!e.receipt_url).length;
    const uncategorised = [...normIncome, ...normExpenses].filter((t) => !t.hmrc_category_id).length;
    const receiptsPct = normExpenses.length > 0 ? (receiptCount / normExpenses.length) * 100 : 100;
    const userConfirmedPct = mappings.length > 0
      ? (mappings.filter((m: any) => m.user_confirmed).length / mappings.length) * 100
      : 100;

    // Heuristic health score (server can't import client lib)
    const coverageScore = txCount > 0 ? ((txCount - uncategorised) / txCount) * 100 : 100;
    const healthScore = Math.round(
      coverageScore * 0.4 + receiptsPct * 0.3 + userConfirmedPct * 0.3,
    );

    // Expense by category
    const catTotals = new Map<string, number>();
    normExpenses.forEach((t: any) => {
      const coa = mapToCoA(t.hmrc_category_id, "expense");
      catTotals.set(coa.name, (catTotals.get(coa.name) || 0) + Number(t.amount));
    });
    const expenseByCategory = Array.from(catTotals.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        pct: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top clients
    const clientTotals = new Map<string, number>();
    normIncome.forEach((t: any) => {
      const name = t.client_name || "(unspecified)";
      clientTotals.set(name, (clientTotals.get(name) || 0) + Number(t.amount));
    });
    const topClients = Array.from(clientTotals.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Edge cases
    const edgeCases: string[] = [];
    if (uncategorised > 0) edgeCases.push(`${uncategorised} uncategorised transactions in account 999 — please review.`);
    const bigNoReceipt = normExpenses.filter((e) => Number(e.amount) > 500 && !e.receipt_url).length;
    if (bigNoReceipt > 0) edgeCases.push(`${bigNoReceipt} expenses over £500 missing receipts.`);
    if (totalExpenses > totalIncome) edgeCases.push("Total expenses exceed income — confirm with founder.");
    if (!profile?.business_name) edgeCases.push("Business name not set in profile.");

    // Founder profile via AI
    const founderProfile = await generateFounderProfile(
      profile,
      expenseByCategory.slice(0, 5).map((c) => c.name),
    );

    // Build ZIP
    const zip = new JSZip();
    const folder = zip.folder("reelin-handoff")!;

    folder.file("README.txt", `Reelin Accountant Handoff Pack
Generated: ${new Date().toISOString()}
Business: ${profile?.business_name || "Unknown"}
Period: ${periodLabel}

Contents:
1-START-HERE.pdf      Cover + summary report
2-transactions.csv    Xero / QuickBooks compatible export
3-chart-of-accounts.csv  UK CoA reference
4-confidence-report.pdf  Book health & risk flags
5-founder-profile.txt    Business context summary
6-source-documents/     Original receipts

Coming soon: one-click Xero/QuickBooks direct import.
`);

    folder.file("2-transactions.csv", buildTransactionsCsv(normIncome, normExpenses));
    folder.file("3-chart-of-accounts.csv", CHART_OF_ACCOUNTS_CSV);
    folder.file(
      "1-START-HERE.pdf",
      buildSummaryPdf({
        businessName: profile?.business_name || "Unnamed Business",
        periodLabel,
        totalIncome,
        totalExpenses,
        txCount,
        healthScore,
        vatRegistered: !!profile?.vat_registered,
        expenseByCategory,
        topClients,
        edgeCases,
      }),
    );
    folder.file(
      "4-confidence-report.pdf",
      buildConfidencePdf({
        healthScore,
        userConfirmedPct,
        txCount,
        receiptsPct,
        uncategorisedCount: uncategorised,
      }),
    );
    folder.file("5-founder-profile.txt", founderProfile);

    // Receipts (best-effort, skip on failure)
    const receiptsFolder = folder.folder("6-source-documents")!;
    for (const exp of normExpenses) {
      if (!exp.receipt_url) continue;
      try {
        // receipt_url stored as path inside `receipts` bucket
        const path = exp.receipt_url.replace(/^.*receipts\//, "");
        const { data: file } = await supabase.storage.from("receipts").download(path);
        if (file) {
          const buf = await file.arrayBuffer();
          const ext = path.split(".").pop() || "bin";
          receiptsFolder.file(`receipt-${exp.id}.${ext}`, new Uint8Array(buf));
        }
      } catch (err) {
        console.warn(`Receipt fetch failed for ${exp.id}:`, err);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });

    // Upload
    const safeName = (profile?.business_name || "business")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    const fileName = `reelin-handoff-${safeName}-${new Date().toISOString().slice(0, 10)}.zip`;
    const filePath = `${user.id}/${Date.now()}-${fileName}`;

    const { error: uploadErr } = await supabase.storage
      .from("handoff-packs")
      .upload(filePath, zipBuffer, {
        contentType: "application/zip",
        upsert: false,
      });
    if (uploadErr) throw uploadErr;

    // Signed URL — 24h
    const { data: signed, error: signErr } = await supabase.storage
      .from("handoff-packs")
      .createSignedUrl(filePath, 86400);
    if (signErr || !signed) throw signErr || new Error("Sign failed");

    const expiresAt = new Date(Date.now() + 86400_000).toISOString();

    // Audit row
    const { data: exportRow, error: insertErr } = await supabase
      .from("handoff_exports")
      .insert({
        user_id: user.id,
        period_label: periodLabel,
        period_start: periodStart || null,
        period_end: periodEnd || null,
        file_path: filePath,
        file_size_bytes: zipBuffer.byteLength,
        transaction_count: txCount,
        receipt_count: receiptCount,
        health_score: healthScore,
        expires_at: expiresAt,
        status: "completed",
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    return new Response(
      JSON.stringify({
        exportId: exportRow.id,
        signedUrl: signed.signedUrl,
        filePath,
        expiresAt,
        stats: { transactions: txCount, receipts: receiptCount, healthScore },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-handoff-pack error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
