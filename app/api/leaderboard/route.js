import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logServerError } from '@/lib/server-errors';

export async function GET() {
  try {
    const { data: users, error } = await getSupabaseAdmin()
      .from('users')
      .select('id, name, green_points, created_at')
      .order('green_points', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      logServerError('[api/leaderboard] User query failed', error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data papan peringkat.' },
        { status: 500 }
      );
    }

    const data = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      green_points: user.green_points ?? 0,
    }));

    return NextResponse.json({
      success: true,
      total_users: data.length,
      data,
    });
  } catch (error) {
    logServerError('[api/leaderboard] Request processing failed', error);
    const isConfigurationError = error instanceof Error && error.message.includes('must be configured');
    return NextResponse.json(
      { success: false, message: isConfigurationError ? 'Backend Supabase belum dikonfigurasi.' : 'Terjadi kesalahan pada server.' },
      { status: isConfigurationError ? 503 : 500 }
    );
  }
}
