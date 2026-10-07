import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const result = await pool.query(`
      SELECT
        id,
        CONCAT(first_name, ' ', last_name) AS name,
        pricing_region
      FROM client
      WHERE deleted_at IS NULL
      ORDER BY first_name, last_name
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
