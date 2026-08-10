import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        TO_CHAR(start_date, 'DD-MM-YYYY') AS start_date,
        TO_CHAR(end_date, 'DD-MM-YYYY') AS end_date,
        deactivated_at,
        created_at
      FROM rate_set
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      data: result.rows,
    });
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
