import { google } from "googleapis";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface GPhoto {
  id: string;
  baseUrl: string;
  filename: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
  };
}

export interface GAlbum {
  id: string;
  title: string;
  productUrl: string;
  mediaItemsCount: string;
  coverPhotoBaseUrl: string;
}

// ─── Build an authenticated OAuth2 client for a given user ─────────────────
async function getOAuthClient(googleId: string) {
  const result = await db
    .select({
      accessToken:  users.accessToken,
      refreshToken: users.refreshToken,
      tokenExpiry:  users.tokenExpiry,
    })
    .from(users)
    .where(eq(users.googleId, googleId))
    .limit(1);

  if (!result.length) throw new Error("User not found");

  const { accessToken, refreshToken, tokenExpiry } = result[0];

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token:  accessToken,
    refresh_token: refreshToken,
    expiry_date:   tokenExpiry ? tokenExpiry.getTime() : undefined,
  });

  // Auto-refresh token if expired and persist back to DB
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await db
        .update(users)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? refreshToken,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          updatedAt: new Date(),
        })
        .where(eq(users.googleId, googleId));
    }
  });

  return oauth2Client;
}

// ─── Resolve an album ID from a share URL ──────────────────────────────────
// Google Photos share URLs don't directly expose the album ID,
// so we list the user's albums and match by productUrl or title.
export async function resolveAlbumFromUrl(
  googleId: string,
  shareUrl: string
): Promise<GAlbum | null> {
  const auth = await getOAuthClient(googleId);

  // Google Photos REST API (not in googleapis SDK — use fetch with token)
  const { token } = await auth.getAccessToken();

  let pageToken: string | undefined;
  do {
    const url = new URL("https://photoslibrary.googleapis.com/v1/albums");
    url.searchParams.set("pageSize", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Photos API error: ${res.statusText}`);

    const data = await res.json();
    const albums: GAlbum[] = data.albums ?? [];

    // Match by productUrl prefix or exact album ID in URL
    const match = albums.find(
      (a) =>
        shareUrl.includes(a.id) ||
        a.productUrl === shareUrl ||
        shareUrl.startsWith(a.productUrl)
    );

    if (match) return match;
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Try shared albums list as fallback
  const sharedRes = await fetch(
    "https://photoslibrary.googleapis.com/v1/sharedAlbums?pageSize=50",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (sharedRes.ok) {
    const sharedData = await sharedRes.json();
    const sharedAlbums: GAlbum[] = sharedData.sharedAlbums ?? [];
    const match = sharedAlbums.find(
      (a) => shareUrl.includes(a.id) || shareUrl.startsWith(a.productUrl)
    );
    if (match) return match;
  }

  return null;
}

// ─── Fetch all media items from an album (handles pagination) ──────────────
export async function fetchAlbumPhotos(
  googleId: string,
  albumId: string
): Promise<GPhoto[]> {
  const auth = await getOAuthClient(googleId);
  const { token } = await auth.getAccessToken();

  const photos: GPhoto[] = [];
  let pageToken: string | undefined;

  do {
    const body: Record<string, unknown> = { albumId, pageSize: 100 };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch(
      "https://photoslibrary.googleapis.com/v1/mediaItems:search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) throw new Error(`Photos API error: ${res.statusText}`);
    const data = await res.json();

    const items: GPhoto[] = (data.mediaItems ?? []).filter(
      (item: GPhoto) => item.mimeType?.startsWith("image/")
    );

    photos.push(...items);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return photos;
}

// ─── Get a refreshed base URL for a media item (URLs expire after ~1h) ─────
export async function refreshPhotoUrl(
  googleId: string,
  mediaItemId: string
): Promise<string | null> {
  const auth = await getOAuthClient(googleId);
  const { token } = await auth.getAccessToken();

  const res = await fetch(
    `https://photoslibrary.googleapis.com/v1/mediaItems/${mediaItemId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  // Append =w800-h800 to get a reasonable resolution
  return data.baseUrl ? `${data.baseUrl}=w800-h800` : null;
}
