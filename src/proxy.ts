import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes - require authentication
  const protectedRoutes = ["/dashboard", "/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes - redirect to dashboard if already logged in
  const authRoutes = ["/sign-in", "/sign-up"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Landing page - redirect to dashboard if already logged in
  const isLandingPage = pathname === "/";

  // Redirect unauthenticated users to sign-in
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages and landing page
  if ((isAuthRoute || isLandingPage) && user) {
    // Check if user has a profile, if not redirect to onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Get invite code if present
    const inviteCode = request.nextUrl.searchParams.get("invite");
    const handle = request.nextUrl.searchParams.get("handle");

    if (!profile) {
      // No profile yet, redirect to onboarding
      const redirectUrl = new URL("/onboarding", request.url);
      if (handle) redirectUrl.searchParams.set("handle", handle);
      if (inviteCode) redirectUrl.searchParams.set("invite", inviteCode);
      return NextResponse.redirect(redirectUrl);
    }

    // Has profile, redirect to dashboard (preserve invite code for processing)
    const redirectUrl = new URL("/dashboard", request.url);
    if (inviteCode) redirectUrl.searchParams.set("invite", inviteCode);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (images, etc)
     * - API routes (handled separately)
     * - Public profile pages (dynamic routes like /dr-smith)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)",
  ],
};
