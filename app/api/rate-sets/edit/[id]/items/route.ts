import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        start_date,
        end_date,
        deactivated_at
      FROM rate_set
      WHERE id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Rate set not found.",
            details: [],
          },
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: result.rows[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to load rate set.",
          details: [error.message],
        },
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await params;

    const body = await request.json();

    const { name, description, start_date, end_date, deactivated_at } = body;

    const result = await pool.query(
      `
      UPDATE rate_set
      SET
        name = $1,
        description = $2,
        start_date = $3,
        end_date = $4,
        deactivated_at = CASE
          WHEN $5 = true THEN NULL
          ELSE COALESCE(deactivated_at, NOW())
        END,
        updated_at = NOW()
      WHERE id = $6
      RETURNING
        id,
        name,
        description,
        start_date,
        end_date,
        deactivated_at
      `,
      [name, description, start_date, end_date, deactivated_at, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Rate set not found.",
            details: [],
          },
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      data: result.rows[0],
      message: "Rate set updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update rate set.",
          details: [error.message],
        },
      },
      {
        status: 500,
      },
    );
  }
}
