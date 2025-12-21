import { getCurrentUser, signAuthToken, getAuthCookieName } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';
import { getSupabaseServerClient, SUPABASE_BUCKET } from '../../../../../lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return Response.json({ success: false, message: 'File must be an image' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return Response.json({ success: false, message: 'File is too large' }, { status: 400 });
    }

    // Generate filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `avatar-${user.id}-${Date.now()}.${ext}`;
    const filePath = `avatars/${filename}`;

    // Upload to Supabase Storage
    const supabaseClient = getSupabaseServerClient();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error: uploadError } = await supabaseClient.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return Response.json({ success: false, message: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data } = supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    const avatarUrl = data.publicUrl;

    // Update user avatar_url in database
    const supabase = getDb();
    const { error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    if (error) {
      console.error('Database update error:', error);
      return Response.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Regenerate JWT token with new avatar_url
    const token = signAuthToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: avatarUrl,
    });

    // Update cookie with new token
    const cookieStore = await cookies();
    const cookieName = getAuthCookieName();
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return Response.json({ success: true, url: avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return Response.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
