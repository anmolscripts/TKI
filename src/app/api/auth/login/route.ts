import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";

type DbUser = {
  email?: string;
  emailLower?: string;
  user?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    remember?: boolean;
  };

  const identifierRaw = (body.email || "").trim();
  const identifierLower = identifierRaw.toLowerCase();
  const password = body.password || "";
  const remember = Boolean(body.remember);

  if (!identifierRaw || !password) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const db = await getDb();
  const usersCollection = db.collection<DbUser>(
    process.env.AUTH_USERS_COLLECTION || "users",
  );

  const user = await usersCollection.findOne({
    $or: [
      { emailLower: identifierLower },
      { email: identifierLower },
      { user: identifierRaw },
      { user: identifierLower },
    ],
  });

  const isValidPassword = Boolean(user && user.password === password);

  if (!isValidPassword) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const maxAgeSeconds = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  const token = await createSessionToken({
    name: user?.user || user?.email || identifierRaw,
    email: user?.email || user?.user || identifierRaw,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return response;
}
