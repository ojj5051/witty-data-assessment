import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, description, start_date, end_date, active } = body;

    const result = await pool.query(
      `
      INSERT INTO rate_set
      (
        name,
        description,
        start_date,
        end_date,
        deactivated_at = CASE
          WHEN $5 = true THEN NULL
          ELSE COALESCE(deactivated_at, NOW())
        END
      )
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, description, start_date, end_date, active ?? true],
    );

    return NextResponse.json({
      message: "Rate set created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.constraint === "rate_set_no_overlap_excl") {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "One or more fields are invalid.",
            details: Array.isArray(error.message)
              ? error.message
              : [error.message],
          },
        },
        {
          status: 400,
        },
      );
    }

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
