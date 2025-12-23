import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { getAuthCookieName, verifyAuthToken } from '../../../../lib/auth';
import {
  getSupabaseServerClient,
  SUPABASE_BUCKET,
  SUPABASE_PUBLIC_PREFIX,
  SUPABASE_READY,
  SUPABASE_CONFIG_ERROR,
} from '../../../../lib/supabase';

const MAX_SIZE = 5 * 1024 * 1024;

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function getCurrent(req: NextRequest) {
  const token = req.cookies.get(getAuthCookieName())?.value;
  const current = token ? verifyAuthToken(token) : null;
  return current;
}

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_READY) {
      console.error('Upload error', SUPABASE_CONFIG_ERROR);
      return NextResponse.json({ error: SUPABASE_CONFIG_ERROR }, { status: 503 });
    }

    const current = getCurrent(req);
    if (!current) return unauthorized();
    if (current.role !== 'ADMIN' && current.role !== 'SHOP') return forbidden();

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'img';
    const path = `products/${current.id}/${Date.now()}-${randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, bytes, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      console.error('Supabase upload error', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (e) {
    console.error('Upload error', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!SUPABASE_READY) {
      console.error('Delete error', SUPABASE_CONFIG_ERROR);
      return NextResponse.json({ error: SUPABASE_CONFIG_ERROR }, { status: 503 });
    }

    const current = getCurrent(req);
    if (!current) return unauthorized();
    if (current.role !== 'ADMIN' && current.role !== 'SHOP') return forbidden();

    const body = await req.json().catch(() => null);
    const url = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!url || !SUPABASE_PUBLIC_PREFIX || !url.startsWith(SUPABASE_PUBLIC_PREFIX)) {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }
    const path = url.slice(SUPABASE_PUBLIC_PREFIX.length);
    if (!path) return NextResponse.json({ error: 'Invalid path' }, { status: 400 });

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
    if (error) {
      console.error('Supabase delete error', error);
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Delete error', e);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
