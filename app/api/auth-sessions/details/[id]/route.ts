import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "Auth Session ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const result = await pool.query(
      `
      SELECT *
      FROM auth_session
      WHERE id = $1
    `,
      [id],
    );

    return NextResponse.json(
      {
        message: "Auth Sessions Details fetched successfully",
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (error) {
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
