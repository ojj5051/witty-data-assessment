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
        code,
        label
      FROM rate_set_support_item_type
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
          message: "Failed to load support categories.",
          details: [error.message],
        },
      },
      {
        status: 500,
      },
    );
  }
}
