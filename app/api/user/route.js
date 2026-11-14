import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logServerError } from '@/lib/server-errors';
import { normalizeUserName } from '@/lib/user-name';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = normalizeUserName(searchParams.get('name'));
    if (!userName) {
      return NextResponse.json(
        { success: false, message: 'Nama pengguna wajib diisi dan maksimal 24 karakter.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, green_points')
      .eq('name', userName)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (userError) {
      logServerError('[api/user] User query failed', userError);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data pengguna.' },
        { status: 500 }
      );
    }

    const { data: userLogs, error: logsError } = await supabase
      .from('action_logs')
      .select('id, action_title, image_url, score, carbon_saved, created_at')
      .eq('user_name', userName)
      .order('created_at', { ascending: false });

    if (logsError) {
      logServerError('[api/user] Action history query failed', logsError);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil riwayat aksi pengguna.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: userData?.name || userName,
        green_points: userData?.green_points ?? 0,
        total_actions: userLogs.length,
      },
      logs: userLogs,
    });
  } catch (error) {
    logServerError('[api/user] Request processing failed', error);
    const isConfigurationError = error instanceof Error && error.message.includes('must be configured');
    return NextResponse.json(
      { success: false, message: isConfigurationError ? 'Backend Supabase belum dikonfigurasi.' : 'Terjadi kesalahan pada server.' },
      { status: isConfigurationError ? 503 : 500 }
    );
  }
}
