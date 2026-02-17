import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    "openid",
    "email",
    "profile",
    // Read-only access to Google Photos albums and media
    "https://www.googleapis.com/auth/photoslibrary.readonly",
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",   // get refresh_token
    scope: scopes,
    prompt: "consent",        // force consent to always get refresh_token
    include_granted_scopes: true,
  });

  return NextResponse.redirect(authUrl);
}
