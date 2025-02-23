import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ Get the request origin dynamically
  const origin = req.headers.get("origin") || "";

  // ✅ Allow all origins dynamically (but required for credentials)
  if (origin) {
    console.log(origin)
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

  // ✅ Handle OPTIONS request (CORS preflight)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  return res;
}

// ✅ Apply middleware to all API routes
export const config = {
  matcher: "/api/:path*",
};
