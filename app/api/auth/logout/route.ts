import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/auth", req.url));
  response.cookies.delete("user_google_id");
  return response;
}
