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
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({ amount: Math.round(amount), currency: 'idr', metadata: { orderId, userId: user.id } });
    await supabase.from('orders').update({ stripe_payment_intent_id: intent.id }).eq('id', orderId);
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
