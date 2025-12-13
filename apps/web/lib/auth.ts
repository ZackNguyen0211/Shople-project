import jwt, { JwtPayload, type SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export type AuthTokenPayload = {
  sub: number;
  email: string;
  name: string;
  role: string;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

const COOKIE_NAME = process.env.API_COOKIE_NAME || 'shoople_token';
const JWT_SECRET: jwt.Secret = process.env.API_JWT_SECRET || 'devsecret_change_me';
const TOKEN_EXPIRES = resolveExpires(process.env.API_JWT_EXPIRES_IN);

function resolveExpires(value: string | undefined): SignOptions['expiresIn'] {
  if (!value) {
    return '7d';
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  return value as SignOptions['expiresIn'];
}

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload & JwtPayload;
    return {
      id: typeof payload.sub === 'string' ? Number(payload.sub) : (payload.sub as number),
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};
