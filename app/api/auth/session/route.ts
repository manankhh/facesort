import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const googleId = req.cookies.get("user_google_id")?.value;

  if (!googleId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);

    if (!result.length) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: result[0] });
  } catch (err) {
    console.error("[Session Error]", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
