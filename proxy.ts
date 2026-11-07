import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale } from "@/content/dictionaries";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
