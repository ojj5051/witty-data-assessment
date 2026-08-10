import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
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
