import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const origin = req.headers.get("origin") || "";

  if (origin) {
    console.log(origin);
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  const protectedRoutes = ["/api/protected", "/api/dashboard"];
  const authToken = req.cookies.get("authToken")?.value;

  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!authToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
