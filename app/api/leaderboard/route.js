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
      .order('id', { ascending: true });

    if (error) {
      logServerError('[api/leaderboard] User query failed', error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data papan peringkat.' },
        { status: 500 }
      );
    }

    let previousPoints;
    let previousRank;
    const rankedUsers = users.map((user, index) => {
      const greenPoints = user.green_points ?? 0;
      const rank = index === 0 || greenPoints !== previousPoints ? index + 1 : previousRank;
      previousPoints = greenPoints;
      previousRank = rank;
      return {
        rank,
        id: user.id,
        name: user.name,
        green_points: greenPoints,
      };
    });

    const data = rankedUsers.slice(0, 10);
    const podium = rankedUsers.filter((user) => user.rank <= 3);

    return NextResponse.json({
      success: true,
      total_users: rankedUsers.length,
      data,
      podium,
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
