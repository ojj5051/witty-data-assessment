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

    const { label, code, permissions } = await request.json();

    const result = await pool.query(
      `
      UPDATE rbac_role
      SET 
        label = $2,
        code = $3
      WHERE id = $1
    `,
      [id, label, code],
    );

    if (permissions) {
      await pool.query(
        `
    DELETE FROM public.rbac_user_role_permission
    WHERE role_id = $1
    `,
        [id],
      );

      await pool.query(
        `
    INSERT INTO public.rbac_user_role_permission (
      role_id,
      permission_id
    )
    SELECT
      $1,
      id
    FROM public.rbac_permission
    WHERE code = ANY($2::text[])
    `,
        [id, permissions],
      );
    }

    return NextResponse.json(
      {
        message: "User Role updated successfully",
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
