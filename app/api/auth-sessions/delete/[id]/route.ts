import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

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
      DELETE FROM auth_session
      WHERE id = $1
    `,
      [id],
    );

    return NextResponse.json(
      {
        message: "Auth Session deleted successfully",
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
