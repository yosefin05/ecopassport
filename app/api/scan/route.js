import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logServerError } from '@/lib/server-errors';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const STORAGE_BUCKET = 'eco-actions';

function getImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { mimeType: 'image/png', extension: 'png' };
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mimeType: 'image/webp', extension: 'webp' };
  }
  return null;
}

function errorResponse(message, status) {
  return NextResponse.json({ success: false, message }, { status });
}

async function removeUnrecordedPhoto(supabase, storagePath) {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (error) {
      logServerError('[api/scan] Failed to remove unrecorded photo', error);
    }
  } catch (error) {
    logServerError('[api/scan] Failed to remove unrecorded photo', error);
  }
}

export async function POST(request) {
  let supabase;
  let storagePath;
  let actionSaved = false;

  try {
    const contentLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 1024 * 1024) {
      return errorResponse('Ukuran foto maksimal 10 MB.', 413);
    }

    const formData = await request.formData();
    const file = formData.get('image');
    const userNameValue = formData.get('user_name');
    const userName = typeof userNameValue === 'string' ? userNameValue.trim() : '';

    if (!file || typeof file.arrayBuffer !== 'function') {
      return errorResponse('Foto aksi ramah lingkungan wajib diunggah.', 400);
    }
    if (file.size === 0) {
      return errorResponse('File foto kosong. Pilih foto lain.', 400);
    }
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('Ukuran foto maksimal 10 MB.', 413);
    }
    if (!userName || userName.length > 24 || /[\u0000-\u001f\u007f]/.test(userName)) {
      return errorResponse('Nama pengguna wajib diisi dan maksimal 24 karakter.', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageType = getImageType(buffer);
    if (!imageType) {
      return errorResponse('Format foto harus berupa JPG, PNG, atau WEBP.', 415);
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('[api/scan] GEMINI_API_KEY is not configured.');
      return errorResponse('Layanan analisis foto belum dikonfigurasi.', 503);
    }

    supabase = getSupabaseAdmin();

    let response;
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analisis apakah gambar menunjukkan aksi ramah lingkungan yang valid (misalnya membawa tumbler, memilah sampah, bersepeda, menggunakan tas kain, atau menghemat energi). Balas hanya JSON dengan struktur:
{"is_valid": boolean, "score": integer 1-100, "carbon_saved": number dalam kg CO2, "action_title": "judul singkat", "reason": "alasan singkat"}
Jika tidak valid, set is_valid false dan jelaskan alasannya.`,
              },
              {
                inlineData: {
                  mimeType: imageType.mimeType,
                  data: buffer.toString('base64'),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });
    } catch (error) {
      logServerError('[api/scan] Gemini request failed', error);
      return errorResponse('Layanan analisis foto sedang bermasalah. Coba lagi nanti.', 502);
    }

    let aiResult;
    try {
      if (typeof response.text !== 'string' || !response.text.trim()) {
        throw new Error('Gemini returned an empty response.');
      }
      aiResult = JSON.parse(response.text);
    } catch (error) {
      logServerError('[api/scan] Gemini returned invalid JSON', error);
      return errorResponse('Hasil analisis foto tidak dapat dibaca. Coba lagi.', 502);
    }

    if (!aiResult || typeof aiResult.is_valid !== 'boolean') {
      logServerError('[api/scan] Gemini response is missing is_valid', new Error('Invalid AI response schema.'));
      return errorResponse('Hasil analisis foto tidak valid. Coba lagi.', 502);
    }

    if (!aiResult.is_valid) {
      const reason = typeof aiResult.reason === 'string' ? aiResult.reason.trim().slice(0, 500) : '';
      return NextResponse.json({
        success: false,
        is_valid: false,
        message: reason || 'Foto tidak terdeteksi sebagai aksi ramah lingkungan.',
        score: 0,
      });
    }

    const score = aiResult.score;
    const carbonSaved = aiResult.carbon_saved;
    const actionTitle = typeof aiResult.action_title === 'string' ? aiResult.action_title.trim() : '';
    const reason = typeof aiResult.reason === 'string' ? aiResult.reason.trim() : '';
    if (
      !Number.isInteger(score) ||
      score < 1 ||
      score > 100 ||
      typeof carbonSaved !== 'number' ||
      !Number.isFinite(carbonSaved) ||
      carbonSaved < 0 ||
      carbonSaved > 1000 ||
      !actionTitle ||
      actionTitle.length > 100 ||
      !reason ||
      reason.length > 500
    ) {
      logServerError('[api/scan] Gemini response failed validation', new Error('AI response fields are outside allowed bounds.'));
      return errorResponse('Hasil analisis foto tidak valid. Coba lagi.', 502);
    }

    storagePath = `${randomUUID()}.${imageType.extension}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: imageType.mimeType,
        upsert: false,
      });

    if (uploadError) {
      logServerError('[api/scan] Supabase Storage upload failed', uploadError);
      return errorResponse('Foto berhasil dianalisis, tetapi gagal disimpan. Coba lagi.', 500);
    }

    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    const imageUrl = publicUrlData?.publicUrl;
    if (!imageUrl) {
      logServerError('[api/scan] Supabase did not return a public image URL', new Error('Public URL is empty.'));
      await removeUnrecordedPhoto(supabase, storagePath);
      return errorResponse('Foto gagal disiapkan untuk disimpan. Coba lagi.', 500);
    }

    const { data: savedAction, error: saveError } = await supabase.rpc('record_eco_action', {
      p_user_name: userName,
      p_image_url: imageUrl,
      p_score: score,
      p_carbon_saved: carbonSaved,
      p_action_title: actionTitle,
    });

    if (saveError) {
      logServerError('[api/scan] Atomic action/points save failed', saveError);
      await removeUnrecordedPhoto(supabase, storagePath);
      return errorResponse('Gagal menyimpan aktivitas dan poin. Tidak ada poin yang ditambahkan.', 500);
    }

    actionSaved = true;
    return NextResponse.json({
      success: true,
      is_valid: true,
      score,
      carbon_saved: carbonSaved,
      action_title: actionTitle,
      message: reason,
      image_url: imageUrl,
      data: savedAction?.log ? [savedAction.log] : [],
    });
  } catch (error) {
    logServerError('[api/scan] Request processing failed', error);
    if (storagePath && supabase && !actionSaved) {
      await removeUnrecordedPhoto(supabase, storagePath);
    }
    const isConfigurationError = error instanceof Error && error.message.includes('must be configured');
    return errorResponse(
      isConfigurationError ? 'Backend Supabase belum dikonfigurasi.' : 'Terjadi kesalahan pada server. Coba lagi nanti.',
      isConfigurationError ? 503 : 500
    );
  }
}
