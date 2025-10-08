import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Get frontend URL from request origin or fallback
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || '';

    if (error) {
      console.error('OAuth error:', error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${origin}/settings?error=${error}`,
        },
      });
    }

    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    // Verify state and get user
    const { data: stateData, error: stateError } = await supabase
      .from('hmrc_oauth_states')
      .select('user_id')
      .eq('state', state)
      .single();

    if (stateError || !stateData) {
      throw new Error('Invalid state');
    }

    // Delete used state
    await supabase
      .from('hmrc_oauth_states')
      .delete()
      .eq('state', state);

    const clientId = Deno.env.get('HMRC_CLIENT_ID');
    const clientSecret = Deno.env.get('HMRC_CLIENT_SECRET');
    const environment = Deno.env.get('HMRC_ENVIRONMENT') || 'sandbox';

    if (!clientId || !clientSecret) {
      throw new Error('HMRC credentials not configured');
    }

    const redirectUri = `${supabaseUrl}/functions/v1/hmrc-oauth-callback`;
    const baseUrl = environment === 'production'
      ? 'https://api.service.hmrc.gov.uk'
      : 'https://test-api.service.hmrc.gov.uk';

    // Exchange code for token
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();

    // Store tokens
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const { error: insertError } = await supabase
      .from('hmrc_tokens')
      .upsert({
        user_id: stateData.user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error storing tokens:', insertError);
      throw new Error('Failed to store tokens');
    }

    console.log('OAuth successful for user:', stateData.user_id);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/settings?hmrc=connected`,
      },
    });
  } catch (error) {
    console.error('Error in hmrc-oauth-callback:', error);
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || '';
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/settings?error=oauth_failed`,
      },
    });
  }
});
