import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { targetUrl, method = 'GET', payload, customHeaders = {} } = await req.json();

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Missing required field: targetUrl' },
        { status: 400 }
      );
    }

    // You can inject standard global API keys here so they evaluate completely securely on the server
    const serverSideHeaders = {
      'Content-Type': 'application/json',
      ...customHeaders,
      // 'Authorization': \`Bearer \${process.env.GLOBAL_API_KEY}\`
    };

    const fetchOptions: RequestInit = {
      method,
      headers: serverSideHeaders,
    };

    if (method !== 'GET' && payload) {
      fetchOptions.body = JSON.stringify(payload);
    }

    // Dial the external API
    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: 'External API Call Failed', details: errorData }, 
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error('Gateway Dispatch Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during Gateway Call', details: error.message },
      { status: 500 }
    );
  }
}
