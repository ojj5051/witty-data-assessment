import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
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
      SELECT *
      FROM client
      WHERE id = $1
    `,
      [id],
    );

    return NextResponse.json(
      {
        message: "Participants fetched successfully",
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch participants",
      },
      { status: 500 },
    );
  }
}
