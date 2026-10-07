import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const result = await pool.query(`
      SELECT
        label,
        code
      FROM rate_set_support_item_pricing_region
      ORDER BY label
    `);

    return NextResponse.json(
      {
        message: "Participants dropdown fetched successfully",
        data: result.rows,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message,
        error,
      },
      { status: 500 },
    );
  }
}
