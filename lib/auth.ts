import crypto from "crypto";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return null;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const result = await pool.query(
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
      AND s.expires_at > NOW()
    `,
    [tokenHash],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
