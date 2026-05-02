import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const MAX_GENERATIONS_PER_HOUR = 10;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_GENERATIONS_PER_HOUR) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

export const proxy = clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (req.nextUrl.pathname === '/api/generate' && req.method === 'POST') {
    const { userId } = await auth();
    if (userId) {
      const { allowed, retryAfterMs } = checkRateLimit(userId);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Rate limit alcanzado. Intenta de nuevo más tarde.', retryAfterMs },
          { status: 429 }
        );
      }
    }
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
