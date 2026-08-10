import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
