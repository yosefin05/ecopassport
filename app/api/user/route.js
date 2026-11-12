import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
export async function GET(request) {
  try {
    // 1. Ambil nama user dari Query Parameter URL (contoh: /api/user?name=Viska)
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('name') || 'Viska';

    // 2. Query Data Profil Pengguna dari tabel 'users'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('green_points')
      .eq('name', userName)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 adalah kode jika data tidak ditemukan
      console.error('Database Error (users):', userError);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data pengguna dari Supabase.' },
        { status: 500 }
      );
    }

    // 3. Query Riwayat Aksi Pengguna dari tabel 'action_logs'
    const { data: userLogs, error: logsError } = await supabase
      .from('action_logs')
      .select('id, action_title, score, carbon_saved, created_at')
      .eq('user_name', userName)
      .order('created_at', { ascending: false }); // Urutkan dari aksi terbaru

    if (logsError) {
      console.error('Database Error (action_logs):', logsError);
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil riwayat aksi dari Supabase.' },
        { status: 500 }
      );
    }

    // 4. Balikkan Respon JSON Sukses ke Frontend (Viska)
    return NextResponse.json({
      success: true,
      user: {
        name: userName,
        green_points: userData ? userData.green_points : 0,
        total_actions: userLogs ? userLogs.length : 0,
      },
      logs: userLogs || [],
    });

  } catch (error) {
    console.error('Error Processing User API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server API backend.', error: error.message },
      { status: 500 }
    );
  }
}