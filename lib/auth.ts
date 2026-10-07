import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export type SessionUser = {
  user_id: string;
  role_id: string | null;
  email: string;
  full_name: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const result = await pool.query<SessionUser>(
    `
    SELECT
      s.user_id,
      s.role_id,
      u.email,
      u.full_name
    FROM public.auth_session s
    JOIN public.app_user u
      ON u.id = s.user_id
    WHERE s.token_hash = $1
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()
      AND u.deactivated_at IS NULL
    `,
    [tokenHash],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 },
    );
  }

  return user;
}
