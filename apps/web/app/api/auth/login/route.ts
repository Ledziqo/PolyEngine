import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, OWNER_EMAIL, OWNER_PASSWORD } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");

  if (email.toLowerCase() !== OWNER_EMAIL.toLowerCase() || password !== OWNER_PASSWORD) {
    const failedUrl = new URL("/login", request.url);
    failedUrl.searchParams.set("error", "invalid");
    if (next.startsWith("/")) {
      failedUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(failedUrl, 303);
  }

  const redirectUrl = new URL(next.startsWith("/") ? next : "/dashboard", request.url);
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set(AUTH_COOKIE, "active", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
