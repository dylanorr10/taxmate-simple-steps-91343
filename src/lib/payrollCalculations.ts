// UK 2025-26 PAYE / NI / Pension calculations
// Source: HMRC rates and thresholds 2025-26

export const TAX_YEAR = "2025-26";

// Personal allowance & income tax bands (England/Wales/NI - rUK)
export const PERSONAL_ALLOWANCE = 12570;
export const BASIC_RATE_LIMIT = 50270;
export const HIGHER_RATE_LIMIT = 125140;

export const BASIC_RATE = 0.20;
export const HIGHER_RATE = 0.40;
export const ADDITIONAL_RATE = 0.45;

// National Insurance (Class 1) - 2025-26
// Employee NI thresholds (annual)
export const EMPLOYEE_NI_PT = 12570; // Primary threshold
export const EMPLOYEE_NI_UEL = 50270; // Upper earnings limit
export const EMPLOYEE_NI_MAIN_RATE = 0.08; // 8% (was 12%, dropped to 8% from Apr 2024)
export const EMPLOYEE_NI_UPPER_RATE = 0.02;

// Employer NI - 2025-26 (Apr 2025 changes: ST dropped to £5k, rate 15%)
export const EMPLOYER_NI_ST = 5000; // Secondary threshold
export const EMPLOYER_NI_RATE = 0.15;

// Auto-enrolment pension defaults (qualifying earnings band)
export const PENSION_LOWER_QE = 6240;
export const PENSION_UPPER_QE = 50270;
export const PENSION_EMPLOYEE_RATE = 0.05;
export const PENSION_EMPLOYER_RATE = 0.03;

// Dividend tax (after £500 allowance)
export const DIVIDEND_ALLOWANCE = 500;
export const DIVIDEND_BASIC_RATE = 0.0875;
export const DIVIDEND_HIGHER_RATE = 0.3375;
export const DIVIDEND_ADDITIONAL_RATE = 0.3935;

export const DIRECTOR_DEFAULT_MONTHLY = 1047.50; // £12,570 / 12

export interface PayrollBreakdown {
  gross: number;
  incomeTax: number;
  employeeNI: number;
  employerNI: number;
  pensionEmployee: number;
  pensionEmployer: number;
  netPay: number;
  totalCostToEmployer: number;
}

/** Calculate annual income tax (rUK rates). */
export function calculateIncomeTax(annualGross: number): number {
  if (annualGross <= PERSONAL_ALLOWANCE) return 0;

  // Personal allowance taper: lose £1 for every £2 over £100k
  let pa = PERSONAL_ALLOWANCE;
  if (annualGross > 100000) {
    pa = Math.max(0, PERSONAL_ALLOWANCE - (annualGross - 100000) / 2);
  }

  const taxable = annualGross - pa;
  let tax = 0;

  const basicBand = Math.min(taxable, BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE);
  if (basicBand > 0) tax += basicBand * BASIC_RATE;

  if (taxable > BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE) {
    const higherBand = Math.min(
      taxable - (BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE),
      HIGHER_RATE_LIMIT - BASIC_RATE_LIMIT
    );
    tax += higherBand * HIGHER_RATE;
  }

  if (taxable > HIGHER_RATE_LIMIT - PERSONAL_ALLOWANCE + (PERSONAL_ALLOWANCE - pa)) {
    const additionalBand = taxable - (HIGHER_RATE_LIMIT - pa);
    if (additionalBand > 0) tax += additionalBand * ADDITIONAL_RATE;
  }

  return Math.max(0, tax);
}

export function calculateEmployeeNI(annualGross: number): number {
  if (annualGross <= EMPLOYEE_NI_PT) return 0;
  const mainBand = Math.min(annualGross, EMPLOYEE_NI_UEL) - EMPLOYEE_NI_PT;
  let ni = mainBand * EMPLOYEE_NI_MAIN_RATE;
  if (annualGross > EMPLOYEE_NI_UEL) {
    ni += (annualGross - EMPLOYEE_NI_UEL) * EMPLOYEE_NI_UPPER_RATE;
  }
  return ni;
}

export function calculateEmployerNI(annualGross: number): number {
  if (annualGross <= EMPLOYER_NI_ST) return 0;
  return (annualGross - EMPLOYER_NI_ST) * EMPLOYER_NI_RATE;
}

export function calculatePension(annualGross: number, includePension = false): {
  employee: number;
  employer: number;
} {
  if (!includePension) return { employee: 0, employer: 0 };
  const qe = Math.max(0, Math.min(annualGross, PENSION_UPPER_QE) - PENSION_LOWER_QE);
  return {
    employee: qe * PENSION_EMPLOYEE_RATE,
    employer: qe * PENSION_EMPLOYER_RATE,
  };
}

/** Full monthly breakdown from an annual gross. */
export function calculateMonthlyPayroll(
  annualGross: number,
  includePension = false
): PayrollBreakdown {
  const incomeTax = calculateIncomeTax(annualGross);
  const employeeNI = calculateEmployeeNI(annualGross);
  const employerNI = calculateEmployerNI(annualGross);
  const pension = calculatePension(annualGross, includePension);

  const monthly = (n: number) => Math.round((n / 12) * 100) / 100;

  const gross = monthly(annualGross);
  const itM = monthly(incomeTax);
  const eeNI = monthly(employeeNI);
  const erNI = monthly(employerNI);
  const peeM = monthly(pension.employee);
  const perM = monthly(pension.employer);

  return {
    gross,
    incomeTax: itM,
    employeeNI: eeNI,
    employerNI: erNI,
    pensionEmployee: peeM,
    pensionEmployer: perM,
    netPay: Math.round((gross - itM - eeNI - peeM) * 100) / 100,
    totalCostToEmployer: Math.round((gross + erNI + perM) * 100) / 100,
  };
}

/** Dividend tax for a director already taking a salary. */
export function calculateDividendTax(salary: number, dividends: number): {
  tax: number;
  band: "basic" | "higher" | "additional" | "allowance";
  effectiveRate: number;
} {
  const taxableDividends = Math.max(0, dividends - DIVIDEND_ALLOWANCE);
  if (taxableDividends === 0) {
    return { tax: 0, band: "allowance", effectiveRate: 0 };
  }

  // Dividends sit on top of other income
  const totalIncome = salary + dividends;
  let tax = 0;

  const basicRoom = Math.max(0, BASIC_RATE_LIMIT - salary - DIVIDEND_ALLOWANCE);
  const inBasic = Math.min(taxableDividends, basicRoom);
  tax += inBasic * DIVIDEND_BASIC_RATE;

  const higherRoom = Math.max(0, HIGHER_RATE_LIMIT - Math.max(salary + DIVIDEND_ALLOWANCE, BASIC_RATE_LIMIT));
  const inHigher = Math.min(Math.max(0, taxableDividends - inBasic), higherRoom);
  tax += inHigher * DIVIDEND_HIGHER_RATE;

  const inAdditional = Math.max(0, taxableDividends - inBasic - inHigher);
  tax += inAdditional * DIVIDEND_ADDITIONAL_RATE;

  let band: "basic" | "higher" | "additional" = "basic";
  if (totalIncome > HIGHER_RATE_LIMIT) band = "additional";
  else if (totalIncome > BASIC_RATE_LIMIT) band = "higher";

  return {
    tax: Math.round(tax * 100) / 100,
    band,
    effectiveRate: tax / dividends,
  };
}

export function formatGBP(n: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}
