import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // 1. Ambil 10 pengguna dengan green_points tertinggi dari tabel 'users'
    const { data: leaderboardData, error } = await supabase
      .from('users')
      .select('id, name, green_points, created_at')
      .order('green_points', { ascending: false }) // Urutkan dari poin tertinggi ke terendah
      .limit(10); // Ambil Top 10 saja

    // 2. Penanganan jika ada error saat query ke Supabase
    if (error) {
      console.error('Database Error (Leaderboard):', error);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data papan peringkat dari Supabase.' },
        { status: 500 }
      );
    }

    // 3. Tambahkan peringkat (rank 1, 2, 3...) secara dinamis ke dalam data
    const formattedLeaderboard = leaderboardData.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      green_points: user.green_points || 0,
    }));

    // 4. Balikkan respon JSON sukses ke Frontend
    return NextResponse.json({
      success: true,
      total_users: formattedLeaderboard.length,
      data: formattedLeaderboard,
    });

  } catch (error) {
    console.error('Error Processing Leaderboard API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server API backend.', error: error.message },
      { status: 500 }
    );
  }
}