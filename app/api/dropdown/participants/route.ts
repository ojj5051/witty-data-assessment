import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        CONCAT(first_name, ' ', last_name) AS name
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
