import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const result = await pool.query(`
      SELECT *
      FROM client
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    return NextResponse.json(
      {
        message: "Participants fetched successfully",
        data: result.rows,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
