import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (category_number)
        id,
        category_number,
        category_name
      FROM rate_set_category
      ORDER BY category_number
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
