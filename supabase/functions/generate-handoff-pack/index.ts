// Generate Accountant Handoff Pack — server-side bundle builder.
// Creates a ZIP with: transactions CSV, chart of accounts CSV, summary PDF,
// confidence report PDF, founder profile (AI-generated), and receipts folder.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  periodStart?: string; // ISO date
  periodEnd?: string;   // ISO date
  periodLabel?: string; // e.g. "Tax Year 2024/25"
}

const DAILY_RATE_LIMIT = 5;

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function csvRow(values: unknown[]): string {
  return values.map(escapeCSV).join(",");
}

function safeFilename(s: string): string {
  return s.replace(/[^a-z0-9-_]/gi, "-").slice(0, 60);
}

// ── Chart of Accounts (mirrored from src/lib/chartOfAccounts.ts) ──────────
const COA = [
  { code: "200", name: "Sales", type: "Revenue", taxType: "Output VAT" },
  { code: "210", name: "Sales — Services", type: "Revenue", taxType: "Output VAT" },
  { code: "220", name: "Sales — Products", type: "Revenue", taxType: "Output VAT" },
  { code: "260", name: "Other Income", type: "Revenue", taxType: "No VAT" },
  { code: "310", name: "Cost of Goods Sold", type: "Cost of Sales", taxType: "Input VAT" },
  { code: "320", name: "Subcontractor Costs", type: "Cost of Sales", taxType: "Input VAT" },
  { code: "400", name: "Advertising & Marketing", type: "Expense", taxType: "Input VAT" },
  { code: "404", name: "Bank Fees", type: "Expense", taxType: "No VAT" },
  { code: "408", name: "General Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "412", name: "Consulting & Professional Fees", type: "Expense", taxType: "Input VAT" },
  { code: "420", name: "Entertainment", type: "Expense", taxType: "No VAT" },
  { code: "424", name: "Postage, Freight & Courier", type: "Expense", taxType: "Input VAT" },
  { code: "433", name: "Insurance", type: "Expense", taxType: "No VAT" },
  { code: "445", name: "Light, Power, Heating", type: "Expense", taxType: "Input VAT" },
  { code: "449", name: "Motor Vehicle Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "453", name: "Office Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "461", name: "Printing & Stationery", type: "Expense", taxType: "Input VAT" },
  { code: "469", name: "Rent", type: "Expense", taxType: "No VAT" },
  { code: "473", name: "Repairs & Maintenance", type: "Expense", taxType: "Input VAT" },
  { code: "477", name: "Wages & Salaries", type: "Expense", taxType: "No VAT" },
  { code: "485", name: "Subscriptions (Software)", type: "Expense", taxType: "Input VAT" },
  { code: "489", name: "Telephone & Internet", type: "Expense", taxType: "Input VAT" },
  { code: "493", name: "Travel — National", type: "Expense", taxType: "Input VAT" },
  { code: "999", name: "REVIEW NEEDED — Uncategorised", type: "Expense", taxType: "No VAT" },
];

function mapToCoA(hmrcCode: string | null, type: "income" | "expense") {
  if (!hmrcCode) return type === "income" ? COA[0] : COA[COA.length - 1];
  const c = hmrcCode.toLowerCase();
  if (type === "income") {
    if (c.includes("service")) return COA.find((x) => x.code === "210")!;
    if (c.includes("product")) return COA.find((x) => x.code === "220")!;
    return COA[0];
  }
  if (c.includes("advert") || c.includes("market")) return COA.find((x) => x.code === "400")!;
  if (c.includes("bank") && c.includes("fee")) return COA.find((x) => x.code === "404")!;
  if (c.includes("subcontract")) return COA.find((x) => x.code === "320")!;
  if (c.includes("legal") || c.includes("professional")) return COA.find((x) => x.code === "412")!;
  if (c.includes("entertain")) return COA.find((x) => x.code === "420")!;
  if (c.includes("insurance")) return COA.find((x) => x.code === "433")!;
  if (c.includes("rent")) return COA.find((x) => x.code === "469")!;
  if (c.includes("repair")) return COA.find((x) => x.code === "473")!;
  if (c.includes("salary") || c.includes("wage")) return COA.find((x) => x.code === "477")!;
  if (c.includes("subscription") || c.includes("software")) return COA.find((x) => x.code === "485")!;
  if (c.includes("phone") || c.includes("internet")) return COA.find((x) => x.code === "489")!;
  if (c.includes("travel")) return COA.find((x) => x.code === "493")!;
  if (c.includes("vehicle") || c.includes("motor") || c.includes("mileage")) return COA.find((x) => x.code === "449")!;
  if (c.includes("utility") || c.includes("electric") || c.includes("heat")) return COA.find((x) => x.code === "445")!;
  if (c.includes("office") || c.includes("home")) return COA.find((x) => x.code === "453")!;
  if (c.includes("print")) return COA.find((x) => x.code === "461")!;
  if (c.includes("postage")) return COA.find((x) => x.code === "424")!;
  return COA.find((x) => x.code === "408")!;
}

// ── Simple book health computation server-side (matches client logic) ──────
function computeHealthScore(income: any[], expenses: any[], profile: any) {
  const all = [...income, ...expenses];
  const categorised = all.filter((t) => t.hmrc_category_id).length;
  const coverage = all.length > 0 ? (categorised / all.length) * 100 : 100;

  const expensesWithReceipts = expenses.filter((e) => e.receipt_url).length;
  const records = expenses.length > 0 ? (expensesWithReceipts / expenses.length) * 100 : 100;

  const hasName = !!profile?.business_name;
  const compliance = hasName ? 80 : 50;

  return Math.round(coverage * 0.25 + records * 0.15 + compliance * 0.20 + 70 * 0.40);
}

// ── PDF: Summary Report (1-START-HERE.pdf) ────────────────────────────────
function buildSummaryPDF(opts: {
  businessName: string;
  periodLabel: string;
  preparedOn: string;
  income: any[];
  expenses: any[];
  taxPeriods: any[];
  vatSubmissions: any[];
  profile: any;
  healthScore: number;
  edgeCases: string[];
}): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 50;

  // Cover
  doc.setFontSize(22).setFont("helvetica", "bold");
  doc.text("Accountant Handoff Pack", 40, y);
  y += 28;
  doc.setFontSize(14).setFont("helvetica", "normal");
  doc.text(opts.businessName || "Your Business", 40, y);
  y += 18;
  doc.setFontSize(10).setTextColor(110);
  doc.text(`${opts.periodLabel} • Prepared ${opts.preparedOn}`, 40, y);
  y += 30;
  doc.setTextColor(0);

  // Health Score
  doc.setFontSize(11).setFont("helvetica", "bold");
  doc.text(`Book Health Score: ${opts.healthScore}/100`, 40, y);
  y += 18;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(`${opts.income.length + opts.expenses.length} transactions • ${opts.expenses.filter((e) => e.receipt_url).length} receipts attached`, 40, y);
  y += 26;

  // Revenue summary
  doc.setFontSize(13).setFont("helvetica", "bold");
  doc.text("Revenue Summary", 40, y);
  y += 18;
  doc.setFont("helvetica", "normal").setFontSize(10);
  const totalIncome = opts.income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = opts.expenses.reduce((s, t) => s + Number(t.amount), 0);
  doc.text(`Total Income:   £${totalIncome.toFixed(2)}`, 50, y); y += 14;
  doc.text(`Total Expenses: £${totalExpenses.toFixed(2)}`, 50, y); y += 14;
  doc.text(`Net Profit:     £${(totalIncome - totalExpenses).toFixed(2)}`, 50, y); y += 22;

  // Top clients
  const clientTotals = new Map<string, number>();
  opts.income.forEach((t) => {
    const k = t.client_name || t.description || "Unknown";
    clientTotals.set(k, (clientTotals.get(k) || 0) + Number(t.amount));
  });
  const topClients = [...clientTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topClients.length) {
    doc.setFont("helvetica", "bold").text("Top 5 Income Sources:", 40, y); y += 14;
    doc.setFont("helvetica", "normal");
    for (const [name, amt] of topClients) {
      doc.text(`• ${name.slice(0, 50)} — £${amt.toFixed(2)}`, 50, y); y += 13;
    }
    y += 10;
  }

  // Expense breakdown
  if (y > 700) { doc.addPage(); y = 50; }
  doc.setFontSize(13).setFont("helvetica", "bold");
  doc.text("Expense Breakdown", 40, y); y += 18;
  doc.setFont("helvetica", "normal").setFontSize(10);
  const catTotals = new Map<string, number>();
  opts.expenses.forEach((e) => {
    const cat = mapToCoA(e.hmrc_category_id, "expense").name;
    catTotals.set(cat, (catTotals.get(cat) || 0) + Number(e.amount));
  });
  const sortedCats = [...catTotals.entries()].sort((a, b) => b[1] - a[1]);
  for (const [cat, amt] of sortedCats) {
    if (y > 780) { doc.addPage(); y = 50; }
    const pct = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : "0";
    doc.text(`${cat.padEnd(40, " ")} £${amt.toFixed(2)} (${pct}%)`, 50, y);
    y += 13;
  }

  // VAT status
  if (y > 700) { doc.addPage(); y = 50; }
  y += 14;
  doc.setFontSize(13).setFont("helvetica", "bold");
  doc.text("VAT Status", 40, y); y += 18;
  doc.setFont("helvetica", "normal").setFontSize(10);
  const vatReg = !!opts.profile?.vat_number;
  doc.text(`VAT Registered: ${vatReg ? "Yes (" + opts.profile.vat_number + ")" : "No"}`, 50, y); y += 14;
  doc.text(`Submissions on file: ${opts.vatSubmissions.length}`, 50, y); y += 14;
  const annualised = totalIncome;
  doc.text(`Turnover this period: £${annualised.toFixed(2)} of £90,000 threshold`, 50, y); y += 22;

  // Edge cases
  if (opts.edgeCases.length) {
    if (y > 680) { doc.addPage(); y = 50; }
    doc.setFontSize(13).setFont("helvetica", "bold");
    doc.text("Items needing attention", 40, y); y += 18;
    doc.setFont("helvetica", "normal").setFontSize(10);
    for (const ec of opts.edgeCases) {
      if (y > 780) { doc.addPage(); y = 50; }
      const lines = doc.splitTextToSize(`• ${ec}`, W - 80);
      doc.text(lines, 50, y);
      y += lines.length * 13;
    }
  }

  return new Uint8Array(doc.output("arraybuffer"));
}

// ── PDF: Confidence Report ─────────────────────────────────────────────────
function buildConfidencePDF(opts: {
  healthScore: number;
  income: any[];
  expenses: any[];
  profile: any;
}): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 50;
  doc.setFontSize(20).setFont("helvetica", "bold");
  doc.text("Confidence Report", 40, y); y += 30;
  doc.setFontSize(14);
  doc.text(`Overall Score: ${opts.healthScore}/100`, 40, y); y += 24;

  doc.setFontSize(10).setFont("helvetica", "normal");
  const all = [...opts.income, ...opts.expenses];
  const categorised = all.filter((t) => t.hmrc_category_id).length;
  const withReceipts = opts.expenses.filter((e) => e.receipt_url).length;
  const uncat = all.length - categorised;

  doc.text(`Total transactions: ${all.length}`, 40, y); y += 14;
  doc.text(`Categorised: ${categorised} (${all.length ? Math.round((categorised / all.length) * 100) : 0}%)`, 40, y); y += 14;
  doc.text(`With receipts: ${withReceipts} of ${opts.expenses.length} expenses`, 40, y); y += 24;

  doc.setFontSize(12).setFont("helvetica", "bold");
  doc.text("Items to verify", 40, y); y += 18;
  doc.setFont("helvetica", "normal").setFontSize(10);

  if (uncat > 0) { doc.text(`• ${uncat} uncategorised transactions (mapped to 999 — REVIEW NEEDED)`, 50, y); y += 14; }
  const noReceipt = opts.expenses.filter((e) => !e.receipt_url && Number(e.amount) > 100);
  if (noReceipt.length) { doc.text(`• ${noReceipt.length} expenses over £100 with no receipt`, 50, y); y += 14; }
  if (!opts.profile?.business_name) { doc.text(`• Business name not set`, 50, y); y += 14; }

  y += 14;
  doc.setFontSize(12).setFont("helvetica", "bold");
  doc.text("Confirmed", 40, y); y += 18;
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(`✓ ${categorised} transactions categorised`, 50, y); y += 14;
  doc.text(`✓ ${withReceipts} receipts attached and indexed`, 50, y); y += 14;
  if (opts.profile?.vat_number) { doc.text(`✓ VAT registered (${opts.profile.vat_number})`, 50, y); y += 14; }

  return new Uint8Array(doc.output("arraybuffer"));
}

// ── Founder profile via Lovable AI ─────────────────────────────────────────
async function generateFounderProfile(profile: any, income: any[], expenses: any[]): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return "Founder profile unavailable (AI not configured).";

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const topExpenseDesc = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 8)
    .map((e) => e.description || "unknown")
    .join(", ");

  const prompt = `Write a single concise paragraph (max 4 sentences) introducing this UK small business to their accountant. Be factual, no fluff, no marketing language.

Business name: ${profile?.business_name || "(not set)"}
Business type: ${profile?.business_type || "sole trader"}
VAT registered: ${profile?.vat_number ? "Yes — " + profile.vat_number : "No"}
Accounting basis: ${profile?.accounting_basis || "cash"}
Total income (period): £${totalIncome.toFixed(0)}
Total expenses (period): £${totalExpenses.toFixed(0)}
Top expense descriptions: ${topExpenseDesc || "none"}

Write in third person. Mention revenue type, expense profile, VAT status, and any obvious notes for the accountant.`;

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
          { role: "system", content: "You write concise factual business summaries for UK accountants." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      return `Founder profile could not be generated automatically. (AI returned ${res.status})`;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "Founder profile unavailable.";
  } catch (e) {
    console.error("AI call failed:", e);
    return "Founder profile generation failed.";
  }
}

// ── Edge cases detector ────────────────────────────────────────────────────
function detectEdgeCases(income: any[], expenses: any[], profile: any, taxPeriods: any[]): string[] {
  const out: string[] = [];
  const uncat = [...income, ...expenses].filter((t) => !t.hmrc_category_id).length;
  if (uncat > 0) out.push(`${uncat} uncategorised transactions — assigned to "999 — REVIEW NEEDED" in the CSV.`);

  const bigNoReceipt = expenses.filter((e) => !e.receipt_url && Number(e.amount) > 500).length;
  if (bigNoReceipt > 0) out.push(`${bigNoReceipt} expenses over £500 have no attached receipt.`);

  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
  if (totalExpenses > totalIncome && totalIncome > 0) out.push(`Total expenses exceed income for this period — confirm this is correct.`);

  const unsubmitted = taxPeriods.filter((p) => p.status !== "submitted" && p.status !== "corrected" && new Date(p.deadline_date) < new Date()).length;
  if (unsubmitted > 0) out.push(`${unsubmitted} past tax period(s) not yet submitted.`);

  if (!profile?.business_name) out.push("Business name not yet set in the profile.");
  if (!profile?.vat_number && totalIncome > 90000) out.push("Annual turnover appears to exceed £90k VAT threshold but no VAT number is set.");

  return out;
}

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user from JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for data + storage
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit: 5 per day
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("handoff_exports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= DAILY_RATE_LIMIT) {
      return new Response(JSON.stringify({ error: "Daily limit of 5 handoff packs reached. Try again tomorrow." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    const periodStart = body.periodStart || null;
    const periodEnd = body.periodEnd || null;
    const periodLabel = body.periodLabel || "All time";

    // Fetch data
    let incomeQ = admin.from("income_transactions").select("*").eq("user_id", user.id);
    let expensesQ = admin.from("expense_transactions").select("*").eq("user_id", user.id);
    if (periodStart) { incomeQ = incomeQ.gte("transaction_date", periodStart); expensesQ = expensesQ.gte("transaction_date", periodStart); }
    if (periodEnd) { incomeQ = incomeQ.lte("transaction_date", periodEnd); expensesQ = expensesQ.lte("transaction_date", periodEnd); }

    const [{ data: income = [] }, { data: expenses = [] }, { data: profile }, { data: taxPeriods = [] }, { data: vatSubmissions = [] }] = await Promise.all([
      incomeQ.order("transaction_date", { ascending: true }),
      expensesQ.order("transaction_date", { ascending: true }),
      admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      admin.from("tax_periods").select("*").eq("user_id", user.id),
      admin.from("vat_submissions").select("*").eq("user_id", user.id),
    ]);

    const incomeArr = income || [];
    const expensesArr = expenses || [];
    const taxPeriodsArr = taxPeriods || [];
    const vatSubmissionsArr = vatSubmissions || [];

    const healthScore = computeHealthScore(incomeArr, expensesArr, profile);
    const edgeCases = detectEdgeCases(incomeArr, expensesArr, profile, taxPeriodsArr);

    // ── Build artefacts ─────────────────────────────────────────────────
    const zip = new JSZip();
    const folder = zip.folder("reelin-handoff")!;

    // 1. transactions.csv
    const headers = ["Date", "Description", "Reference", "Amount", "Currency", "Account Code", "Account Name", "Tax Type", "Tax Amount", "Contact", "Notes", "Receipt Link"];
    const txnRows: string[] = [csvRow(headers)];
    const receiptManifest: { sourcePath: string; zipPath: string; row: number }[] = [];

    incomeArr.forEach((t: any, i: number) => {
      const coa = mapToCoA(t.hmrc_category_id, "income");
      const taxAmount = Number(t.amount) - Number(t.amount) / (1 + Number(t.vat_rate || 0) / 100);
      txnRows.push(csvRow([
        t.transaction_date, t.description || "", t.invoice_number || "",
        Number(t.amount).toFixed(2), "GBP", coa.code, coa.name,
        t.vat_rate > 0 ? `${t.vat_rate}% (VAT on Income)` : "No VAT",
        taxAmount.toFixed(2), t.client_name || "", "", "",
      ]));
    });

    expensesArr.forEach((t: any, i: number) => {
      const coa = mapToCoA(t.hmrc_category_id, "expense");
      const taxAmount = Number(t.amount) - Number(t.amount) / (1 + Number(t.vat_rate || 0) / 100);
      let receiptLink = "";
      if (t.receipt_url) {
        const fname = `receipt-${t.transaction_date}-${safeFilename(t.description || "expense")}-${i}`;
        receiptLink = `6-source-documents/${fname}`;
        receiptManifest.push({ sourcePath: t.receipt_url, zipPath: receiptLink, row: i });
      }
      txnRows.push(csvRow([
        t.transaction_date, t.description || "", "",
        (-Number(t.amount)).toFixed(2), "GBP", coa.code, coa.name,
        t.vat_rate > 0 ? `${t.vat_rate}% (VAT on Expenses)` : "No VAT",
        taxAmount.toFixed(2), "", t.disallowable_reason || "", receiptLink,
      ]));
    });

    folder.file("2-transactions.csv", txnRows.join("\n"));

    // 2. chart-of-accounts.csv
    const coaRows = [csvRow(["Code", "Name", "Type", "Tax Type"])];
    COA.forEach((c) => coaRows.push(csvRow([c.code, c.name, c.type, c.taxType])));
    folder.file("3-chart-of-accounts.csv", coaRows.join("\n"));

    // 3. summary PDF
    const summaryPdf = buildSummaryPDF({
      businessName: profile?.business_name || "Your Business",
      periodLabel,
      preparedOn: new Date().toLocaleDateString("en-GB"),
      income: incomeArr,
      expenses: expensesArr,
      taxPeriods: taxPeriodsArr,
      vatSubmissions: vatSubmissionsArr,
      profile,
      healthScore,
      edgeCases,
    });
    folder.file("1-START-HERE.pdf", summaryPdf);

    // 4. confidence PDF
    const confidencePdf = buildConfidencePDF({ healthScore, income: incomeArr, expenses: expensesArr, profile });
    folder.file("4-confidence-report.pdf", confidencePdf);

    // 5. founder profile
    const founderProfile = await generateFounderProfile(profile, incomeArr, expensesArr);
    folder.file("5-founder-profile.txt", founderProfile);

    // 6. receipts
    let receiptsAdded = 0;
    if (receiptManifest.length) {
      const receiptsFolder = folder.folder("6-source-documents")!;
      for (const r of receiptManifest) {
        try {
          // Receipt URL might be a storage path or full URL
          let path = r.sourcePath;
          if (path.includes("/storage/v1/object/")) {
            path = path.split("/receipts/")[1] || path;
          } else if (path.startsWith("http")) {
            // External URL — fetch directly
            const resp = await fetch(path);
            if (resp.ok) {
              const ext = (path.split(".").pop() || "bin").split("?")[0].slice(0, 5);
              const data = new Uint8Array(await resp.arrayBuffer());
              receiptsFolder.file(`${r.zipPath.split("/").pop()}.${ext}`, data);
              receiptsAdded++;
            }
            continue;
          }
          const { data: blob } = await admin.storage.from("receipts").download(path);
          if (blob) {
            const ext = (path.split(".").pop() || "bin").slice(0, 5);
            const data = new Uint8Array(await blob.arrayBuffer());
            receiptsFolder.file(`${r.zipPath.split("/").pop()}.${ext}`, data);
            receiptsAdded++;
          }
        } catch (e) {
          console.warn("Receipt fetch failed:", r.sourcePath, e);
        }
      }
    }

    // README
    folder.file("README.txt", `REELIN ACCOUNTANT HANDOFF PACK
═══════════════════════════════════════════════

Business: ${profile?.business_name || "—"}
Period:   ${periodLabel}
Prepared: ${new Date().toLocaleString("en-GB")}

WHAT'S IN THIS BUNDLE
─────────────────────
1-START-HERE.pdf        Read this first. Summary + items needing attention.
2-transactions.csv      All transactions, Xero/QuickBooks compatible.
3-chart-of-accounts.csv UK CoA mapping. Import once into your software.
4-confidence-report.pdf Book Health Score + verification checklist.
5-founder-profile.txt   1-paragraph business context.
6-source-documents/     Receipts (${receiptsAdded} files), referenced in the CSV.

HOW TO USE
──────────
1. Read 1-START-HERE.pdf (5 minutes).
2. Import 3-chart-of-accounts.csv into Xero/QB if needed.
3. Import 2-transactions.csv. Account codes are pre-mapped.
4. Cross-reference any "999 — REVIEW NEEDED" rows against the confidence report.
5. Source documents in folder 6 are linked in the CSV's "Receipt Link" column.

Coming soon: one-click direct import to Xero / QuickBooks.
`);

    // ── Upload ──────────────────────────────────────────────────────────
    const zipBlob = await zip.generateAsync({ type: "uint8array" });
    const dateStr = new Date().toISOString().slice(0, 10);
    const bizSlug = safeFilename(profile?.business_name || "business");
    const filename = `reelin-handoff-${bizSlug}-${dateStr}-${crypto.randomUUID().slice(0, 8)}.zip`;
    const filePath = `${user.id}/${filename}`;

    const { error: upErr } = await admin.storage.from("handoff-packs").upload(filePath, zipBlob, {
      contentType: "application/zip",
      upsert: false,
    });
    if (upErr) throw upErr;

    const { data: signed } = await admin.storage
      .from("handoff-packs")
      .createSignedUrl(filePath, 24 * 60 * 60);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: exportRow } = await admin.from("handoff_exports").insert({
      user_id: user.id,
      period_label: periodLabel,
      period_start: periodStart,
      period_end: periodEnd,
      file_path: filePath,
      file_size_bytes: zipBlob.byteLength,
      transaction_count: incomeArr.length + expensesArr.length,
      receipt_count: receiptsAdded,
      health_score: healthScore,
      expires_at: expiresAt,
      status: "completed",
    }).select().single();

    // Period close lock — mark relevant tax periods
    if (periodStart && periodEnd) {
      await admin.from("tax_periods")
        .update({ handoff_sent_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .gte("start_date", periodStart)
        .lte("end_date", periodEnd);
    }

    return new Response(JSON.stringify({
      success: true,
      exportId: exportRow?.id,
      downloadUrl: signed?.signedUrl,
      expiresAt,
      filename,
      stats: {
        transactions: incomeArr.length + expensesArr.length,
        receipts: receiptsAdded,
        healthScore,
        sizeBytes: zipBlob.byteLength,
        edgeCases: edgeCases.length,
      },
      founderProfile,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Handoff generation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
