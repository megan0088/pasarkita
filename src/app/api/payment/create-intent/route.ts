import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { orderId, amount } = await req.json();
    if (!orderId || !amount) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    // Verify order belongs to this user
    const { data: order } = await supabase.from('orders').select('buyer_id').eq('id', orderId).single();
    if (!order || order.buyer_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({ amount: Math.round(amount), currency: 'IDR', metadata: { orderId, userId: user.id } });
    await supabase.from('orders').update({ stripe_payment_intent_id: intent.id }).eq('id', orderId);
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
