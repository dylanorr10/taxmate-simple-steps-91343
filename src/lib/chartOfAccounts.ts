// UK Chart of Accounts mapping (Xero-compatible codes)
// Maps internal HMRC category codes to standard UK CoA codes used by accountants.

export interface CoAEntry {
  code: string;
  name: string;
  type: "Revenue" | "Direct Costs" | "Expense" | "Asset" | "Liability";
}

// Static UK CoA — the canonical list shipped in 3-chart-of-accounts.csv
export const UK_CHART_OF_ACCOUNTS: CoAEntry[] = [
  // Revenue
  { code: "200", name: "Sales", type: "Revenue" },
  { code: "260", name: "Other Revenue", type: "Revenue" },
  // Direct Costs
  { code: "310", name: "Cost of Goods Sold", type: "Direct Costs" },
  // Operating Expenses
  { code: "400", name: "Advertising & Marketing", type: "Expense" },
  { code: "404", name: "Bank Fees", type: "Expense" },
  { code: "408", name: "General Expenses", type: "Expense" },
  { code: "412", name: "Consulting & Accountancy", type: "Expense" },
  { code: "420", name: "Entertainment", type: "Expense" },
  { code: "425", name: "Freight & Courier", type: "Expense" },
  { code: "429", name: "General Expenses", type: "Expense" },
  { code: "433", name: "Insurance", type: "Expense" },
  { code: "437", name: "Interest Expense", type: "Expense" },
  { code: "441", name: "Legal Expenses", type: "Expense" },
  { code: "445", name: "Light, Power, Heating", type: "Expense" },
  { code: "449", name: "Motor Vehicle Expenses", type: "Expense" },
  { code: "453", name: "Office Expenses", type: "Expense" },
  { code: "461", name: "Postage, Freight & Courier", type: "Expense" },
  { code: "463", name: "Printing & Stationery", type: "Expense" },
  { code: "469", name: "Rent", type: "Expense" },
  { code: "473", name: "Repairs & Maintenance", type: "Expense" },
  { code: "477", name: "Wages & Salaries", type: "Expense" },
  { code: "478", name: "Subcontractors", type: "Expense" },
  { code: "485", name: "Software Subscriptions", type: "Expense" },
  { code: "489", name: "Telephone & Internet", type: "Expense" },
  { code: "493", name: "Travel - National", type: "Expense" },
  { code: "494", name: "Travel - International", type: "Expense" },
  { code: "497", name: "Bank Charges", type: "Expense" },
  { code: "499", name: "Home Office", type: "Expense" },
  // Review needed
  { code: "999", name: "REVIEW NEEDED - Uncategorised", type: "Expense" },
];

// Map HMRC category codes (from hmrc_categories.code) → CoA codes.
// Unknown / null codes fall back to 999 for expenses, 260 for income.
const HMRC_TO_COA: Record<string, string> = {
  // Income
  turnover: "200",
  other_income: "260",
  sales: "200",
  // Common expense categories
  cost_of_goods: "310",
  goods_bought_for_resale: "310",
  cost_of_sales: "310",
  advertising: "400",
  marketing: "400",
  bank_charges: "404",
  accountancy_fees: "412",
  legal_fees: "441",
  professional_fees: "412",
  entertainment: "420",
  insurance: "433",
  interest: "437",
  utilities: "445",
  motor_expenses: "449",
  vehicle: "449",
  office_costs: "453",
  office_supplies: "453",
  postage: "461",
  printing: "463",
  rent: "469",
  premises: "469",
  repairs: "473",
  wages: "477",
  staff_costs: "477",
  subcontractors: "478",
  software: "485",
  subscriptions: "485",
  it_costs: "485",
  phone: "489",
  telephone: "489",
  internet: "489",
  travel: "493",
  travel_uk: "493",
  travel_overseas: "494",
  home_office: "499",
  use_of_home: "499",
};

export function mapHmrcToCoA(
  hmrcCode: string | null | undefined,
  type: "income" | "expense",
): CoAEntry {
  if (!hmrcCode) {
    return type === "income"
      ? UK_CHART_OF_ACCOUNTS.find((e) => e.code === "200")!
      : UK_CHART_OF_ACCOUNTS.find((e) => e.code === "999")!;
  }
  const normalised = hmrcCode.toLowerCase().replace(/[^a-z_]/g, "_");
  const code = HMRC_TO_COA[normalised];
  if (code) {
    const entry = UK_CHART_OF_ACCOUNTS.find((e) => e.code === code);
    if (entry) return entry;
  }
  // Heuristic fallbacks
  if (type === "income") {
    return UK_CHART_OF_ACCOUNTS.find((e) => e.code === "260")!;
  }
  if (normalised.includes("software") || normalised.includes("subscription"))
    return UK_CHART_OF_ACCOUNTS.find((e) => e.code === "485")!;
  if (normalised.includes("travel"))
    return UK_CHART_OF_ACCOUNTS.find((e) => e.code === "493")!;
  if (normalised.includes("office"))
    return UK_CHART_OF_ACCOUNTS.find((e) => e.code === "453")!;
  return UK_CHART_OF_ACCOUNTS.find((e) => e.code === "408")!;
}

export function chartOfAccountsCsv(): string {
  const header = "Code,Name,Type";
  const rows = UK_CHART_OF_ACCOUNTS.map(
    (e) => `${e.code},"${e.name}",${e.type}`,
  );
  return [header, ...rows].join("\n");
}
