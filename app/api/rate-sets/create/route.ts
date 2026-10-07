import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

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
        deactivated_at
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        CASE
          WHEN $5 = true THEN NULL
          ELSE NOW()
        END
      )
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
          message: "Rate set dates overlap an existing rate set.",
          error: {
            code: "VALIDATION_ERROR",
            message: "One or more fields are invalid.",
            details: ["Rate set dates overlap an existing rate set."],
          },
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create rate set",
      },
      {
        status: 500,
      },
    );
  }
}
