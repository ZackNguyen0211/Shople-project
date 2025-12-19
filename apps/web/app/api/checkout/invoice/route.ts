import { NextRequest, NextResponse } from 'next/server';

// Demo-only: no real email is sent. We just respond success for UI flow.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim();
    const orderId = String(body.orderId || '').trim();
    const total = Number(body.total || 0);
    const itemCount = Number(body.itemCount || 0);

    if (!email || !orderId) {
      return NextResponse.json({ error: 'Missing email or orderId' }, { status: 400 });
    }

    console.log('Invoice request (demo, no email sent):', { email, orderId, total, itemCount });

    return NextResponse.json({ ok: true, message: 'Đã ghi nhận yêu cầu hóa đơn (demo).' });
  } catch (e) {
    console.error('Invoice send error:', e);
    return NextResponse.json({ error: 'Failed to handle invoice' }, { status: 500 });
  }
}
