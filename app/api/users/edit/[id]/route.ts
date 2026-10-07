import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import argon2 from "argon2";
import { requireUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await params;

    const { email, full_name, role_id, deactivated_at, password } =
      await request.json();

    const result = await pool.query(
      `
      UPDATE app_user
      SET 
        email = $2,
        full_name = $3,
        deactivated_at = CASE
          WHEN $4 = true THEN NULL
          ELSE COALESCE(deactivated_at, NOW())
        END
      WHERE id = $1
    `,
      [id, email, full_name, deactivated_at],
    );

    await pool.query(
      `
      UPDATE rbac_user_role
      SET 
        role_id = $2
      WHERE user_id = $1
    `,
      [id, role_id],
    );

    return NextResponse.json(
      {
        message: "User updated successfully",
        data: {
          user: result.rows[0],
        },
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
