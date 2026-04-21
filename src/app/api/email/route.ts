import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or html.' },
        { status: 400 }
      );
    }

    // Checking for API key configuration
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not configured.");
      // In a real environment, this throws. Here we simulate success for the playground sandbox.
      return NextResponse.json({ 
        success: true, 
        message: 'Mock email sent successfully. Please add RESEND_API_KEY to execute real deliveries.' 
      }, { status: 200 });
    }

    // Actual Implementation Logic using Resend API (or similar provider)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'NovaOS <notifications@nova-builder.local>',
        to,
        subject,
        html
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
