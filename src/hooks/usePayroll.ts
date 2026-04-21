import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PersonType = "director" | "contractor" | "employee";
export type IR35Status = "inside" | "outside" | "unknown";
export type RunStatus = "draft" | "paid" | "exported";

export interface PayrollSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  employer_reference: string | null;
  paye_scheme_reference: string | null;
  auto_create_expenses: boolean;
}

export interface PayrollPerson {
  id: string;
  user_id: string;
  person_type: PersonType;
  name: string;
  email: string | null;
  annual_salary: number;
  monthly_salary: number;
  ni_category: string | null;
  ir35_status: IR35Status | null;
  utr: string | null;
  start_date: string | null;
  active: boolean;
  notes: string | null;
}

export interface PayrollRun {
  id: string;
  user_id: string;
  person_id: string;
  pay_month: string;
  gross: number;
  income_tax: number;
  employee_ni: number;
  employer_ni: number;
  pension_contribution: number;
  net_pay: number;
  status: RunStatus;
  expense_transaction_id: string | null;
  notes: string | null;
}

export const usePayrollSettings = () => {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["payroll-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("payroll_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as PayrollSettings | null;
    },
  });

  const upsert = useMutation({
    mutationFn: async (patch: Partial<PayrollSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("payroll_settings")
        .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll-settings"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    settings,
    isLoading,
    enabled: settings?.enabled ?? false,
    update: upsert.mutate,
  };
};

export const usePayrollPeople = () => {
  const qc = useQueryClient();

  const { data: people = [], isLoading } = useQuery({
    queryKey: ["payroll-people"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("payroll_people")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as PayrollPerson[];
    },
  });

  const add = useMutation({
    mutationFn: async (person: Omit<PayrollPerson, "id" | "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("payroll_people")
        .insert({ ...person, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-people"] });
      toast.success("Person added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<PayrollPerson> & { id: string }) => {
      const { error } = await supabase.from("payroll_people").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll-people"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payroll_people").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-people"] });
      toast.success("Removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    people,
    directors: people.filter((p) => p.person_type === "director"),
    contractors: people.filter((p) => p.person_type === "contractor"),
    employees: people.filter((p) => p.person_type === "employee"),
    isLoading,
    add: add.mutate,
    update: update.mutate,
    remove: remove.mutate,
  };
};

export const usePayrollRuns = (personId?: string) => {
  const qc = useQueryClient();

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ["payroll-runs", personId ?? "all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      let q = supabase
        .from("payroll_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("pay_month", { ascending: false });
      if (personId) q = q.eq("person_id", personId);
      const { data, error } = await q;
      if (error) throw error;
      return data as PayrollRun[];
    },
  });

  const create = useMutation({
    mutationFn: async (run: Omit<PayrollRun, "id" | "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert run
      const { data: inserted, error } = await supabase
        .from("payroll_runs")
        .insert({ ...run, user_id: user.id })
        .select()
        .single();
      if (error) throw error;

      // Auto-create matching expense if settings allow
      const { data: settings } = await supabase
        .from("payroll_settings")
        .select("auto_create_expenses")
        .eq("user_id", user.id)
        .maybeSingle();
      const { data: person } = await supabase
        .from("payroll_people")
        .select("name, person_type")
        .eq("id", run.person_id)
        .single();

      if (settings?.auto_create_expenses && person) {
        const totalCost =
          run.gross + run.employer_ni + run.pension_contribution;
        const { data: expense } = await supabase
          .from("expense_transactions")
          .insert({
            user_id: user.id,
            amount: totalCost,
            description: `Payroll: ${person.name} (${person.person_type}) — ${run.pay_month}`,
            transaction_date: run.pay_month,
            vat_rate: 0,
          })
          .select()
          .single();
        if (expense) {
          await supabase
            .from("payroll_runs")
            .update({ expense_transaction_id: expense.id })
            .eq("id", inserted.id);
        }
      }
      return inserted;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
      qc.invalidateQueries({ queryKey: ["expense-transactions"] });
      toast.success("Payroll run saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payroll_runs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast.success("Run deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { runs, isLoading, create: create.mutate, remove: remove.mutate };
};
