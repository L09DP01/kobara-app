import { NextResponse } from 'next/server';
import { getCurrentUserAndMerchant } from '@/lib/auth/get-current-user';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { merchant, error } = await getCurrentUserAndMerchant();

    if (error || !merchant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canUseLive = merchant.kyc_status === 'approved';
    // If not approved, force 'test' in the response to be safe, regardless of what's in DB
    const environment = canUseLive ? (merchant.current_environment || 'test') : 'test';

    return NextResponse.json({
      environment,
      canUseLive,
      kycStatus: merchant.kyc_status || 'not_started'
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/environment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { merchant, error } = await getCurrentUserAndMerchant();

    if (error || !merchant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const requestedEnvironment = body.environment;

    if (!['test', 'live'].includes(requestedEnvironment)) {
      return NextResponse.json({ error: 'Invalid environment' }, { status: 400 });
    }

    if (requestedEnvironment === 'live' && merchant.kyc_status !== 'approved') {
      return NextResponse.json(
        { 
          error: 'kyc_required', 
          message: 'Veuillez vérifier votre compte pour activer le Live Mode.' 
        }, 
        { status: 403 }
      );
    }

    // Update merchant's current_environment
    const supabase = supabaseServer();
    const { error: updateError } = await supabase
      .from('merchants')
      .update({ current_environment: requestedEnvironment })
      .eq('id', merchant.id);

    if (updateError) {
      console.error('Error updating merchant environment:', updateError);
      return NextResponse.json({ error: 'Failed to update environment' }, { status: 500 });
    }

    return NextResponse.json({ success: true, environment: requestedEnvironment });
  } catch (error) {
    console.error('Error in POST /api/dashboard/environment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
