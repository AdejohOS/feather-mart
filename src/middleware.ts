import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  const publicRoutes = new Set(["/", "/vendor-market", "/terms", "/cart"]);
  const authRoutes = new Set([
    "/auth/sign-in",
    "/auth/sign-up",
    "/vendor-market/auth/sign-up",
    "/vendor-market/auth/sign-in",
    "/vendor-market/auth/callback",
  ]);

  const isPublic = [...publicRoutes, ...authRoutes].some((r) =>
    pathname.startsWith(r)
  );

  // Skip middleware on callback routes
  if (pathname.startsWith("/auth/callback")) return response;

  // Redirect if trying to access a private page without session
  const session = request.cookies.get("sb-access-token")?.value;
  if (!session && !isPublic) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
