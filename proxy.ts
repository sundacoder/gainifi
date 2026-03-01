/**
 * Gainifi Middleware
 * Simplified for prototype — all routes accessible without auth.
 * In production, integrate Supabase auth from lib/supabase/middleware.ts.
 */

import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    // For the prototype, simply pass through all requests.
    return NextResponse.next();
}

export default proxy;

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
