import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/auth?error=${error ?? "missing_code"}`, req.url)
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    if (!profile.id || !profile.email) {
      throw new Error("Failed to retrieve user profile");
    }

    // Upsert user + tokens in Neon DB
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.googleId, profile.id))
      .limit(1);

    if (existingUser.length > 0) {
      await db
        .update(users)
        .set({
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token ?? existingUser[0].refreshToken,
          tokenExpiry: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(users.googleId, profile.id));
    } else {
      await db.insert(users).values({
        googleId: profile.id,
        email: profile.email,
        name: profile.name ?? "",
        avatarUrl: profile.picture ?? "",
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? "",
        tokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      });
    }

    // Set session cookie and redirect
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("user_google_id", profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[OAuth Callback Error]", err);
    return NextResponse.redirect(
      new URL("/auth?error=server_error", req.url)
    );
  }
}
