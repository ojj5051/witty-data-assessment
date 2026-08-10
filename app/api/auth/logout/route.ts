import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("session_token")?.value;

    if (token) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      await pool.query(
        `
        DELETE FROM public.auth_session
        WHERE token_hash = $1
        `,
        [tokenHash],
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 },
    );
  }
}