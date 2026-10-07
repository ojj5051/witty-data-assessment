import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.invoice_number,
        i.amount,
        i.expected_amount,
        i.status,
        i.active,
        TO_CHAR(i.invoice_date, 'DD-MM-YYYY') AS invoice_date,

        CONCAT(c.first_name, ' ', c.last_name) AS client_id,

        p.name AS provider_id,

        i.created_at

      FROM invoice i

      LEFT JOIN client c
        ON i.client_id = c.id

      LEFT JOIN provider p
        ON i.provider_id = p.id

      ORDER BY i.created_at DESC
    `);

    return NextResponse.json({
      data: result.rows,
    });
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
