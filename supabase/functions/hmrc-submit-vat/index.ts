import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { periodKey, vatReturn } = await req.json();

    // Check if user is in demo mode
    const { data: profile } = await supabase
      .from('profiles')
      .select('demo_mode, vat_number')
      .eq('id', user.id)
      .single();

    const isDemoMode = profile?.demo_mode === true;

    // Handle demo mode - simulate successful submission
    if (isDemoMode) {
      console.log('Demo mode: Simulating HMRC submission');
      
      // Store submission in database
      const { error: submissionError } = await supabase
        .from('vat_submissions')
        .insert({
          user_id: user.id,
          period_key: periodKey,
          vat_due_sales: vatReturn.vatDueSales,
          vat_due_acquisitions: vatReturn.vatDueAcquisitions,
          total_vat_due: vatReturn.totalVatDue,
          vat_reclaimed_curr_period: vatReturn.vatReclaimedCurrPeriod,
          net_vat_due: vatReturn.netVatDue,
          total_value_sales_ex_vat: vatReturn.totalValueSalesExVAT,
          total_value_purchases_ex_vat: vatReturn.totalValuePurchasesExVAT,
          total_value_goods_supplied_ex_vat: vatReturn.totalValueGoodsSuppliedExVAT,
          total_acquisitions_ex_vat: vatReturn.totalAcquisitionsExVAT,
          submitted_at: new Date().toISOString(),
        });

      if (submissionError) {
        console.error('Error storing demo submission:', submissionError);
        throw new Error('Failed to save demo submission');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          demo: true,
          result: { 
            processingDate: new Date().toISOString(),
            paymentIndicator: 'DD',
            formBundleNumber: 'DEMO-' + Date.now()
          } 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Production mode - real HMRC submission
    // Get HMRC tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('hmrc_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('HMRC not connected. Please authorize first.');
    }

    // Check if token is expired and refresh if needed
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      // Refresh token logic here
      console.log('Token expired, would refresh here');
      throw new Error('Token expired. Please reconnect to HMRC.');
    }

    const environment = Deno.env.get('HMRC_ENVIRONMENT') || 'sandbox';
    const baseUrl = environment === 'production'
      ? 'https://api.service.hmrc.gov.uk'
      : 'https://test-api.service.hmrc.gov.uk';

    if (!profile?.vat_number) {
      throw new Error('VAT number not set in profile');
    }

    // Submit VAT return to HMRC
    const response = await fetch(
      `${baseUrl}/organisations/vat/${profile.vat_number}/returns`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.hmrc.1.0+json',
        },
        body: JSON.stringify({
          periodKey,
          vatDueSales: vatReturn.vatDueSales,
          vatDueAcquisitions: vatReturn.vatDueAcquisitions,
          totalVatDue: vatReturn.totalVatDue,
          vatReclaimedCurrPeriod: vatReturn.vatReclaimedCurrPeriod,
          netVatDue: vatReturn.netVatDue,
          totalValueSalesExVAT: vatReturn.totalValueSalesExVAT,
          totalValuePurchasesExVAT: vatReturn.totalValuePurchasesExVAT,
          totalValueGoodsSuppliedExVAT: vatReturn.totalValueGoodsSuppliedExVAT,
          totalAcquisitionsExVAT: vatReturn.totalAcquisitionsExVAT,
          finalised: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HMRC submission failed:', errorText);
      throw new Error('HMRC submission failed');
    }

    const result = await response.json();

    // Store submission in database
    const { error: submissionError } = await supabase
      .from('vat_submissions')
      .insert({
        user_id: user.id,
        period_key: periodKey,
        vat_due_sales: vatReturn.vatDueSales,
        vat_due_acquisitions: vatReturn.vatDueAcquisitions,
        total_vat_due: vatReturn.totalVatDue,
        vat_reclaimed_curr_period: vatReturn.vatReclaimedCurrPeriod,
        net_vat_due: vatReturn.netVatDue,
        total_value_sales_ex_vat: vatReturn.totalValueSalesExVAT,
        total_value_purchases_ex_vat: vatReturn.totalValuePurchasesExVAT,
        total_value_goods_supplied_ex_vat: vatReturn.totalValueGoodsSuppliedExVAT,
        total_acquisitions_ex_vat: vatReturn.totalAcquisitionsExVAT,
        submitted_at: new Date().toISOString(),
      });

    if (submissionError) {
      console.error('Error storing submission:', submissionError);
    }

    console.log('VAT return submitted successfully:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in hmrc-submit-vat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
