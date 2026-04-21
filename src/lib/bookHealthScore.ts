// Pure scoring functions for the Book Health Score.
// All inputs are plain data — easy to unit test, no React/Supabase deps.

import type { Transaction } from "@/hooks/useTransactions";
import type { Profile } from "@/hooks/useProfile";

export type IssueSeverity = "fix" | "improve" | "good";

export interface ScoreIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail?: string;
  link?: string;          // route or route+query (e.g. "/log?filter=uncategorised")
  lessonId?: string;      // opens InlineLesson
}

export interface CategoryScore {
  key: string;
  label: string;
  weight: number;         // 0–1
  score: number;          // 0–100
  issues: ScoreIssue[];
}

export interface BookHealthResult {
  score: number;          // 0–100 weighted total
  breakdown: CategoryScore[];
  fixNow: ScoreIssue[];
  improve: ScoreIssue[];
  allGood: ScoreIssue[];
}

interface ScoreInputs {
  income: Transaction[];
  expenses: Transaction[];
  profile: Profile | null | undefined;
  taxPeriods: Array<{ status: string; deadline_date: string }>;
  vatSubmissions: Array<{ submitted_at: string | null; created_at: string }>;
  /** Annualised turnover used for VAT threshold check */
  annualTurnover: number;
}

const VAT_THRESHOLD = 90000;

// ───────────────────────────────────────────────────────────────────────────
// Category 1: Transaction Coverage (25%)
// ───────────────────────────────────────────────────────────────────────────
function scoreTransactionCoverage(inputs: ScoreInputs): CategoryScore {
  const all = [...inputs.income, ...inputs.expenses];
  const issues: ScoreIssue[] = [];

  if (all.length === 0) {
    issues.push({
      id: "no-transactions",
      severity: "fix",
      title: "No transactions logged yet",
      detail: "Add your first income or expense to start scoring.",
      link: "/log",
    });
    return { key: "coverage", label: "Transaction Coverage", weight: 0.25, score: 0, issues };
  }

  const uncategorised = all.filter(t => !t.hmrc_category_id);
  const pct = ((all.length - uncategorised.length) / all.length) * 100;

  if (uncategorised.length > 0) {
    issues.push({
      id: "uncategorised",
      severity: uncategorised.length > all.length * 0.3 ? "fix" : "improve",
      title: `${uncategorised.length} uncategorised transaction${uncategorised.length === 1 ? "" : "s"}`,
      detail: "Each transaction needs an HMRC category for your tax return.",
      link: "/log?filter=uncategorised",
      lessonId: "hmrc-categories-explained",
    });
  } else {
    issues.push({
      id: "all-categorised",
      severity: "good",
      title: "Every transaction is categorised",
    });
  }

  return { key: "coverage", label: "Transaction Coverage", weight: 0.25, score: Math.round(pct), issues };
}

// ───────────────────────────────────────────────────────────────────────────
// Category 2: Accuracy Confidence (20%)
// Heuristic: short/missing descriptions + zero-amount items reduce confidence.
// ───────────────────────────────────────────────────────────────────────────
function scoreAccuracyConfidence(inputs: ScoreInputs): CategoryScore {
  const all = [...inputs.income, ...inputs.expenses];
  const issues: ScoreIssue[] = [];

  if (all.length === 0) {
    return { key: "accuracy", label: "Accuracy Confidence", weight: 0.20, score: 100, issues };
  }

  const vague = all.filter(t => !t.description || t.description.trim().length < 4);
  const pct = ((all.length - vague.length) / all.length) * 100;

  if (vague.length > 0) {
    issues.push({
      id: "vague-descriptions",
      severity: vague.length > all.length * 0.25 ? "fix" : "improve",
      title: `${vague.length} item${vague.length === 1 ? "" : "s"} with unclear description`,
      detail: "Clear descriptions help your accountant trust the books.",
      link: "/log",
    });
  } else {
    issues.push({
      id: "clear-descriptions",
      severity: "good",
      title: "All items have clear descriptions",
    });
  }

  return { key: "accuracy", label: "Accuracy Confidence", weight: 0.20, score: Math.round(pct), issues };
}

// ───────────────────────────────────────────────────────────────────────────
// Category 3: Compliance Signals (20%)
// ───────────────────────────────────────────────────────────────────────────
function scoreCompliance(inputs: ScoreInputs): CategoryScore {
  const issues: ScoreIssue[] = [];
  let score = 100;

  // Business name
  if (!inputs.profile?.business_name) {
    score -= 20;
    issues.push({
      id: "missing-business-name",
      severity: "fix",
      title: "Business name not set",
      detail: "Required on tax submissions and invoices.",
      link: "/settings",
    });
  }

  // VAT threshold awareness
  const turnover = inputs.annualTurnover;
  if (turnover >= VAT_THRESHOLD && !inputs.profile?.vat_registered) {
    score -= 35;
    issues.push({
      id: "vat-threshold-breached",
      severity: "fix",
      title: "Turnover above VAT threshold",
      detail: `You're over £${VAT_THRESHOLD.toLocaleString()} but not registered for VAT.`,
      link: "/tax",
      lessonId: "vat-threshold-explained",
    });
  } else if (turnover >= VAT_THRESHOLD * 0.9 && !inputs.profile?.vat_registered) {
    score -= 15;
    issues.push({
      id: "vat-threshold-near",
      severity: "improve",
      title: "Approaching VAT threshold",
      detail: `Plan ahead — registration is mandatory at £${VAT_THRESHOLD.toLocaleString()}.`,
      link: "/tax",
      lessonId: "vat-threshold-explained",
    });
  } else {
    issues.push({
      id: "vat-ok",
      severity: "good",
      title: "VAT status looks correct",
    });
  }

  // Sanity: expenses > income
  const totalIn = inputs.income.reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = inputs.expenses.reduce((s, t) => s + Number(t.amount), 0);
  if (inputs.income.length > 0 && totalOut > totalIn * 1.5) {
    score -= 15;
    issues.push({
      id: "expenses-exceed-income",
      severity: "improve",
      title: "Expenses far exceed income",
      detail: "Double-check for personal items mixed in with business expenses.",
      link: "/log",
    });
  }

  return {
    key: "compliance",
    label: "Compliance Signals",
    weight: 0.20,
    score: Math.max(0, Math.round(score)),
    issues,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Category 4: Record Completeness (15%) — receipts on expenses
// ───────────────────────────────────────────────────────────────────────────
function scoreRecordCompleteness(inputs: ScoreInputs): CategoryScore {
  const issues: ScoreIssue[] = [];

  if (inputs.expenses.length === 0) {
    return { key: "records", label: "Record Completeness", weight: 0.15, score: 100, issues };
  }

  const noReceipt = inputs.expenses.filter(e => !e.receipt_url);
  const pct = ((inputs.expenses.length - noReceipt.length) / inputs.expenses.length) * 100;

  if (noReceipt.length > 0) {
    issues.push({
      id: "missing-receipts",
      severity: noReceipt.length > inputs.expenses.length * 0.5 ? "fix" : "improve",
      title: `${noReceipt.length} expense${noReceipt.length === 1 ? "" : "s"} missing a receipt`,
      detail: "HMRC requires receipts for any expense you claim.",
      link: "/log?filter=no-receipt",
      lessonId: "why-receipts-matter",
    });
  } else {
    issues.push({
      id: "all-receipts",
      severity: "good",
      title: "Every expense has a receipt",
    });
  }

  return {
    key: "records",
    label: "Record Completeness",
    weight: 0.15,
    score: Math.round(pct),
    issues,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Category 5: Consistency (10%) — same merchant → same category
// ───────────────────────────────────────────────────────────────────────────
function scoreConsistency(inputs: ScoreInputs): CategoryScore {
  const issues: ScoreIssue[] = [];
  const grouped = new Map<string, Set<string>>();

  for (const t of inputs.expenses) {
    const key = (t.description || "").toLowerCase().trim();
    if (!key || !t.hmrc_category_id) continue;
    if (!grouped.has(key)) grouped.set(key, new Set());
    grouped.get(key)!.add(t.hmrc_category_id);
  }

  const inconsistent = Array.from(grouped.entries()).filter(([, cats]) => cats.size > 1);
  const totalGroups = Math.max(grouped.size, 1);
  const pct = ((totalGroups - inconsistent.length) / totalGroups) * 100;

  if (inconsistent.length > 0) {
    issues.push({
      id: "inconsistent-categories",
      severity: "improve",
      title: `${inconsistent.length} merchant${inconsistent.length === 1 ? "" : "s"} categorised inconsistently`,
      detail: `e.g. "${inconsistent[0][0]}" appears under multiple categories.`,
      link: "/log",
    });
  } else if (grouped.size > 0) {
    issues.push({
      id: "consistent",
      severity: "good",
      title: "Categories applied consistently",
    });
  }

  return {
    key: "consistency",
    label: "Consistency",
    weight: 0.10,
    score: Math.round(pct),
    issues,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Category 6: Tax Readiness (10%)
// ───────────────────────────────────────────────────────────────────────────
function scoreTaxReadiness(inputs: ScoreInputs): CategoryScore {
  const issues: ScoreIssue[] = [];
  let score = 100;
  const now = Date.now();

  // Past quarters must be submitted
  const pastDue = inputs.taxPeriods.filter(
    p => new Date(p.deadline_date).getTime() < now && p.status !== "submitted" && p.status !== "corrected",
  );
  if (pastDue.length > 0) {
    score -= 50;
    issues.push({
      id: "missed-quarters",
      severity: "fix",
      title: `${pastDue.length} past quarter${pastDue.length === 1 ? "" : "s"} not submitted`,
      detail: "Submit overdue periods to avoid HMRC penalties.",
      link: "/tax",
    });
  }

  // VAT submission freshness
  const lastSub = inputs.vatSubmissions
    .map(s => new Date(s.submitted_at || s.created_at).getTime())
    .sort((a, b) => b - a)[0];
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (lastSub && now - lastSub > 90 * 24 * 60 * 60 * 1000) {
    score -= 20;
    issues.push({
      id: "stale-vat",
      severity: "improve",
      title: "VAT estimate is stale",
      detail: "Refresh your VAT return — last update was over 90 days ago.",
      link: "/tax",
    });
  }

  if (issues.length === 0) {
    issues.push({
      id: "tax-fresh",
      severity: "good",
      title: "Tax submissions up to date",
    });
  }

  return {
    key: "tax",
    label: "Tax Readiness",
    weight: 0.10,
    score: Math.max(0, Math.round(score)),
    issues,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Public entry point
// ───────────────────────────────────────────────────────────────────────────
export function computeBookHealth(inputs: ScoreInputs): BookHealthResult {
  const breakdown: CategoryScore[] = [
    scoreTransactionCoverage(inputs),
    scoreAccuracyConfidence(inputs),
    scoreCompliance(inputs),
    scoreRecordCompleteness(inputs),
    scoreConsistency(inputs),
    scoreTaxReadiness(inputs),
  ];

  const totalWeight = breakdown.reduce((s, c) => s + c.weight, 0);
  const weighted = breakdown.reduce((s, c) => s + c.score * c.weight, 0) / totalWeight;
  const score = Math.round(weighted);

  const allIssues = breakdown.flatMap(c => c.issues);
  const fixNow = allIssues.filter(i => i.severity === "fix");
  const improve = allIssues.filter(i => i.severity === "improve");
  const allGood = allIssues.filter(i => i.severity === "good");

  return { score, breakdown, fixNow, improve, allGood };
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Accountant-ready";
  if (score >= 50) return "Almost there";
  return "Needs work";
}

export function scoreToneClass(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}
