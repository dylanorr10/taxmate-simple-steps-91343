import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const clientId = Deno.env.get('TRUELAYER_CLIENT_ID');
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/truelayer-oauth-callback`;
    
    // Generate random state for CSRF protection
    const state = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store state in database
    const { error: stateError } = await supabaseClient
      .from('hmrc_oauth_states')
      .insert({
        user_id: user.id,
        state,
        expires_at: expiresAt.toISOString(),
      });

    if (stateError) {
      console.error('Error storing state:', stateError);
      throw stateError;
    }

    // Build TrueLayer authorization URL for sandbox
    const authUrl = new URL('https://auth.truelayer-sandbox.com');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId!);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'info accounts balance transactions offline_access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('providers', 'uk-ob-all uk-oauth-all');

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in truelayer-oauth-init:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});