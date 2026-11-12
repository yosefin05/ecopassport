import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

// Inisialisasi Google Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    // 1. Menerima Form Data dari Frontend (Foto & Nama User)
    const formData = await request.formData();
    const file = formData.get('image');
    const userName = formData.get('user_name') || 'Viska';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Foto aksi ramah lingkungan wajib diunggah!' },
        { status: 400 }
      );
    }

    // 2. Konversi File Gambar ke Format Buffer & Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // 3. Prompting Gemini Vision untuk Analisis Gambar Aksi Ramah Lingkungan
    const prompt = `
    Analisis gambar ini untuk aplikasi EcoPassport AI (Green Habit Tracker).
    Tentukan apakah gambar ini menunjukkan aksi ramah lingkungan yang valid (seperti membawa tumbler, memilah sampah, bersepeda, menggunakan kantong belanja kain, atau menghemat energi).

    Kembalikan respon dalam format JSON murni TANPA markdown formatting dengan struktur berikut:
    {
      "is_valid": true/false,
      "score": angka 1-100 (berikan skor tinggi jika gambar jelas),
      "carbon_saved": angka estimasi kg CO2 yang dikurangi (contoh: 0.5),
      "action_title": "Judul Aksi Singkat",
      "reason": "Penjelasan singkat 1 kalimat alasan validasi"
    }
    `;

    // 4. Panggil Gemini API (Menggunakan Model Gemini 1.5 Flash)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    // 5. Parse Respon JSON dari Gemini AI
    const resultText = response.text;
    const aiResult = JSON.parse(resultText);

    // 6. Jika Aksi Tidak Valid (Bukan Foto Ramah Lingkungan / Curang)
    if (!aiResult.is_valid) {
      return NextResponse.json({
        success: false,
        is_valid: false,
        message: aiResult.reason || 'Foto tidak terdeteksi sebagai aksi ramah lingkungan.',
        score: 0,
      });
    }

    // 7. Simpan Log Aksi ke Tabel 'action_logs' di Supabase
    const { data: logData, error: logError } = await supabase
      .from('action_logs')
      .insert([
        {
          user_name: userName,
          score: aiResult.score,
          carbon_saved: aiResult.carbon_saved,
        },
      ])
      .select();

    if (logError) {
      console.error('Database Error (action_logs):', logError);
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan ke database Supabase.' },
        { status: 500 }
      );
    }

    // 8. Update Akumulasi Green Points Pengguna di Tabel 'users'
    // Cek dulu apakah user sudah ada di database
    const { data: userData } = await supabase
      .from('users')
      .select('green_points')
      .eq('name', userName)
      .single();

    if (userData) {
      // Jika user ada, tambahkan poin lama dengan poin baru dari AI
      const updatedPoints = (userData.green_points || 0) + aiResult.score;
      await supabase
        .from('users')
        .update({ green_points: updatedPoints })
        .eq('name', userName);
    } else {
      // Jika user belum ada, buat record baru
      await supabase
        .from('users')
        .insert([{ name: userName, green_points: aiResult.score }]);
    }

    // 9. Balikkan Respon Sukses ke Frontend (Viska)
    return NextResponse.json({
      success: true,
      is_valid: true,
      score: aiResult.score,
      carbon_saved: aiResult.carbon_saved,
      action_title: aiResult.action_title,
      message: aiResult.reason,
      data: logData,
    });

  } catch (error) {
    console.error('Error Processing Scan API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server API backend.', error: error.message },
      { status: 500 }
    );
  }
}