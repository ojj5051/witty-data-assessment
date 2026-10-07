import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        email
      FROM app_user
      ORDER BY id
      `,
    );

    return NextResponse.json({
      data: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to load users dropdown.",
          details: [error.message],
        },
      },
      {
        status: 500,
      },
    );
  }
}
