// Standard UK Chart of Accounts (compatible with Xero / QuickBooks defaults).
// Maps Reelin's HMRC category codes → standard CoA codes used by accountants.

export interface CoAEntry {
  code: string;
  name: string;
  type: "Revenue" | "Cost of Sales" | "Expense" | "Asset" | "Liability" | "Equity";
  taxType: "Output VAT" | "Input VAT" | "No VAT";
}

export const UK_CHART_OF_ACCOUNTS: CoAEntry[] = [
  // Revenue
  { code: "200", name: "Sales", type: "Revenue", taxType: "Output VAT" },
  { code: "210", name: "Sales — Services", type: "Revenue", taxType: "Output VAT" },
  { code: "220", name: "Sales — Products", type: "Revenue", taxType: "Output VAT" },
  { code: "260", name: "Other Income", type: "Revenue", taxType: "No VAT" },

  // Cost of Sales
  { code: "310", name: "Cost of Goods Sold", type: "Cost of Sales", taxType: "Input VAT" },
  { code: "320", name: "Subcontractor Costs", type: "Cost of Sales", taxType: "Input VAT" },

  // Operating Expenses
  { code: "400", name: "Advertising & Marketing", type: "Expense", taxType: "Input VAT" },
  { code: "404", name: "Bank Fees", type: "Expense", taxType: "No VAT" },
  { code: "408", name: "General Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "412", name: "Consulting & Professional Fees", type: "Expense", taxType: "Input VAT" },
  { code: "416", name: "Depreciation", type: "Expense", taxType: "No VAT" },
  { code: "420", name: "Entertainment", type: "Expense", taxType: "No VAT" },
  { code: "424", name: "Postage, Freight & Courier", type: "Expense", taxType: "Input VAT" },
  { code: "429", name: "General Office Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "433", name: "Insurance", type: "Expense", taxType: "No VAT" },
  { code: "437", name: "Interest Expense", type: "Expense", taxType: "No VAT" },
  { code: "441", name: "Legal Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "445", name: "Light, Power, Heating", type: "Expense", taxType: "Input VAT" },
  { code: "449", name: "Motor Vehicle Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "453", name: "Office Expenses", type: "Expense", taxType: "Input VAT" },
  { code: "461", name: "Printing & Stationery", type: "Expense", taxType: "Input VAT" },
  { code: "469", name: "Rent", type: "Expense", taxType: "No VAT" },
  { code: "473", name: "Repairs & Maintenance", type: "Expense", taxType: "Input VAT" },
  { code: "477", name: "Wages & Salaries", type: "Expense", taxType: "No VAT" },
  { code: "478", name: "Pension Costs", type: "Expense", taxType: "No VAT" },
  { code: "485", name: "Subscriptions (Software)", type: "Expense", taxType: "Input VAT" },
  { code: "489", name: "Telephone & Internet", type: "Expense", taxType: "Input VAT" },
  { code: "493", name: "Travel — National", type: "Expense", taxType: "Input VAT" },
  { code: "494", name: "Travel — International", type: "Expense", taxType: "No VAT" },
  { code: "497", name: "Bank Service Charges", type: "Expense", taxType: "No VAT" },

  // Special
  { code: "999", name: "REVIEW NEEDED — Uncategorised", type: "Expense", taxType: "No VAT" },
];

/**
 * Maps a Reelin HMRC category code to a UK CoA entry.
 * Falls back to 999 (REVIEW NEEDED) for unmapped/missing categories.
 */
export function mapHmrcToCoA(
  hmrcCode: string | null | undefined,
  type: "income" | "expense",
): CoAEntry {
  if (!hmrcCode) {
    return type === "income"
      ? UK_CHART_OF_ACCOUNTS.find((c) => c.code === "200")!
      : UK_CHART_OF_ACCOUNTS.find((c) => c.code === "999")!;
  }

  const code = hmrcCode.toLowerCase();

  // Income mappings
  if (type === "income") {
    if (code.includes("service")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "210")!;
    if (code.includes("product") || code.includes("good")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "220")!;
    if (code.includes("other")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "260")!;
    return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "200")!;
  }

  // Expense mappings
  if (code.includes("advert") || code.includes("market")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "400")!;
  if (code.includes("bank") && code.includes("fee")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "404")!;
  if (code.includes("subcontract")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "320")!;
  if (code.includes("cost_of_goods") || code.includes("cogs")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "310")!;
  if (code.includes("legal") || code.includes("professional")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "412")!;
  if (code.includes("entertain")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "420")!;
  if (code.includes("insurance")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "433")!;
  if (code.includes("interest")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "437")!;
  if (code.includes("rent")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "469")!;
  if (code.includes("repair") || code.includes("maintenance")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "473")!;
  if (code.includes("salary") || code.includes("wage")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "477")!;
  if (code.includes("pension")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "478")!;
  if (code.includes("subscription") || code.includes("software")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "485")!;
  if (code.includes("phone") || code.includes("internet") || code.includes("telecom")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "489")!;
  if (code.includes("travel")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "493")!;
  if (code.includes("vehicle") || code.includes("motor") || code.includes("mileage")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "449")!;
  if (code.includes("utility") || code.includes("electric") || code.includes("heat")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "445")!;
  if (code.includes("office") || code.includes("home")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "453")!;
  if (code.includes("print") || code.includes("stationery")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "461")!;
  if (code.includes("postage") || code.includes("freight") || code.includes("courier")) return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "424")!;

  return UK_CHART_OF_ACCOUNTS.find((c) => c.code === "408")!; // General Expenses
}

export function chartOfAccountsCSV(): string {
  const headers = ["Code", "Name", "Type", "Tax Type"];
  const rows = UK_CHART_OF_ACCOUNTS.map((c) => [c.code, c.name, c.type, c.taxType]);
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
