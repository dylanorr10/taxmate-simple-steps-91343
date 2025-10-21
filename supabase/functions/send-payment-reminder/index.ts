import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReminderRequest {
  incomeTransactionId: string;
  reminderType: 'gentle' | 'firm' | 'final';
}

const getEmailTemplate = (
  clientName: string,
  amount: number,
  invoiceNumber: string,
  daysOverdue: number,
  reminderType: string,
  businessName: string
) => {
  const templates = {
    gentle: {
      subject: `Friendly Reminder: Invoice ${invoiceNumber} Payment`,
      body: `
        <h2>Hi ${clientName},</h2>
        <p>I hope this email finds you well.</p>
        <p>This is a friendly reminder that invoice <strong>#${invoiceNumber}</strong> for <strong>£${amount.toFixed(2)}</strong> is now ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.</p>
        <p>If you've already sent payment, please disregard this email. Otherwise, I'd appreciate if you could arrange payment at your earliest convenience.</p>
        <p>If there are any issues or queries, please don't hesitate to reach out.</p>
        <p>Best regards,<br>${businessName}</p>
      `
    },
    firm: {
      subject: `Payment Required: Invoice ${invoiceNumber} - ${daysOverdue} Days Overdue`,
      body: `
        <h2>Dear ${clientName},</h2>
        <p>I'm writing to follow up on invoice <strong>#${invoiceNumber}</strong> for <strong>£${amount.toFixed(2)}</strong>, which is now ${daysOverdue} days overdue.</p>
        <p>I've not yet received payment or heard back regarding this invoice. Please can you arrange payment within the next 7 days.</p>
        <p>If there's a problem with the invoice or service provided, please contact me immediately so we can resolve it.</p>
        <p>Thank you for your prompt attention to this matter.</p>
        <p>Regards,<br>${businessName}</p>
      `
    },
    final: {
      subject: `URGENT: Final Notice - Invoice ${invoiceNumber} Payment Required`,
      body: `
        <h2>Dear ${clientName},</h2>
        <p>This is a final notice regarding outstanding invoice <strong>#${invoiceNumber}</strong> for <strong>£${amount.toFixed(2)}</strong>, now ${daysOverdue} days overdue.</p>
        <p>Despite previous reminders, payment has not been received. Please arrange immediate payment to avoid further action.</p>
        <p>If payment has been sent recently, please provide payment confirmation. Otherwise, I require payment within 3 working days.</p>
        <p>Thank you,<br>${businessName}</p>
      `
    }
  };

  return templates[reminderType as keyof typeof templates];
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { incomeTransactionId, reminderType }: PaymentReminderRequest = await req.json();

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from("income_transactions")
      .select("*, profiles!inner(business_name)")
      .eq("id", incomeTransactionId)
      .eq("user_id", user.id)
      .single();

    if (txError || !transaction) {
      throw new Error("Transaction not found");
    }

    if (!transaction.client_email) {
      throw new Error("No client email address");
    }

    // Calculate days overdue
    const dueDate = new Date(transaction.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const businessName = transaction.profiles?.business_name || "Your Business";
    const template = getEmailTemplate(
      transaction.client_name || "Valued Client",
      Number(transaction.amount),
      transaction.invoice_number || "N/A",
      daysOverdue,
      reminderType,
      businessName
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: `${businessName} <onboarding@resend.dev>`,
      to: [transaction.client_email],
      subject: template.subject,
      html: template.body,
    });

    // Record reminder sent
    await supabase
      .from("payment_reminders")
      .insert({
        user_id: user.id,
        income_transaction_id: incomeTransactionId,
        reminder_type: reminderType,
        days_overdue: daysOverdue,
      });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending payment reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
