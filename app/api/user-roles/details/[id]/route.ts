import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        rr.*
      FROM public.rbac_role rr
      WHERE rr.id = $1
    `,
      [id],
    );

    const permission_ids = await pool.query(
      `
      SELECT
        rup.permission_id
      FROM public.rbac_user_role_permission rup
      WHERE rup.role_id = $1
    `,
      [id],
    );

    const permission_codes = await pool.query(
      `
      SELECT
        rp.code
      FROM public.rbac_permission rp
      WHERE rp.id = ANY($1)
    `,
      [permission_ids.rows.map((p) => p.permission_id)],
    );

    return NextResponse.json(
      {
        message: "User role details fetched successfully",
        data: {
          ...result.rows[0],
          permissions: permission_codes.rows,
        },
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
