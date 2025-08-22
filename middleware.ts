import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (token) {
    console.log("Token exists:", token);
  } else {
    console.log("Token not found");
  }
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/verify-email",
    "/auth/verify-phone",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // // If user is not authenticated and trying to access protected route
  // if (!token && !isPublicRoute && pathname !== "/") {
  //   return NextResponse.redirect(new URL("/auth/signin", request.url));
  // }

  // // If user is authenticated and trying to access auth pages
  // if (token && isPublicRoute) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
