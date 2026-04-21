import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { platform, authorizationCode, redirectUri } = await req.json();

    if (!platform || !authorizationCode) {
      return NextResponse.json(
        { error: 'Missing required OAuth fields: platform, authorizationCode.' },
        { status: 400 }
      );
    }

    // A mapping database of platform integration keys 
    // In production, these derive from your exact .env.local OAuth IDs
    const PLATFORM_CONFIGS: Record<string, { tokenUrl: string, clientId: string, clientSecret: string }> = {
      'google': {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
      },
      'stripe': {
        tokenUrl: 'https://connect.stripe.com/oauth/token',
        clientId: process.env.STRIPE_CLIENT_ID || '',
        clientSecret: process.env.STRIPE_SECRET_KEY || ''
      },
      'slack': {
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        clientId: process.env.SLACK_CLIENT_ID || '',
        clientSecret: process.env.SLACK_CLIENT_SECRET || ''
      }
    };

    const config = PLATFORM_CONFIGS[platform];

    if (!config) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    // Execute server-side, securing the clientSecret out of the browser
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code: authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri || 'https://nova-builder.local/callback/oauth'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'OAuth Exchange Failed', details: data }, { status: response.status });
    }

    // Here you would typically save \`data.access_token\` into your Supabase Data table for the logged-in User
    return NextResponse.json({ 
      success: true, 
      message: `Successfully connected ${platform} Platform API.`,
      payload: data 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Platform OAuth Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during Platform integration', details: error.message },
      { status: 500 }
    );
  }
}
