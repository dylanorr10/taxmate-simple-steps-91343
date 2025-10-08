import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify state
    const { data: stateData, error: stateError } = await supabaseClient
      .from('hmrc_oauth_states')
      .select('*')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid state parameter');
    }

    // Check if state has expired
    if (new Date(stateData.expires_at) < new Date()) {
      throw new Error('State has expired');
    }

    // Exchange code for token
    const clientId = Deno.env.get('TRUELAYER_CLIENT_ID');
    const clientSecret = Deno.env.get('TRUELAYER_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/truelayer-oauth-callback`;

    const tokenResponse = await fetch('https://auth.truelayer-sandbox.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();

    // Get account information
    const accountsResponse = await fetch('https://api.truelayer-sandbox.com/data/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!accountsResponse.ok) {
      console.error('Failed to fetch accounts');
      throw new Error('Failed to fetch account information');
    }

    const accountsData = await accountsResponse.json();
    const account = accountsData.results?.[0];

    // Store connection
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const { error: connectionError } = await supabaseClient
      .from('truelayer_connections')
      .insert({
        user_id: stateData.user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        provider: account?.provider?.display_name || 'TrueLayer',
        account_id: account?.account_id || 'unknown',
        account_name: account?.display_name || 'Bank Account',
      });

    if (connectionError) {
      console.error('Error storing connection:', connectionError);
      throw connectionError;
    }

    // Delete used state
    await supabaseClient
      .from('hmrc_oauth_states')
      .delete()
      .eq('state', state);

    // Redirect back to settings page
    const redirectUrl = `${url.origin}/settings?truelayer_connected=true`;
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });
  } catch (error) {
    console.error('Error in truelayer-oauth-callback:', error);
    const url = new URL(req.url);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const redirectUrl = `${url.origin}/settings?truelayer_error=${encodeURIComponent(message)}`;
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
      },
    });
  }
});