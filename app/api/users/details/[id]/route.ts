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
      SELECT
        au.*,
        rr.id AS role_id,
        rr.code AS role_code,
        rr.label AS role
      FROM public.app_user au

      LEFT JOIN public.rbac_user_role rur
        ON rur.user_id = au.id

      LEFT JOIN public.rbac_role rr
        ON rr.id = rur.role_id

      WHERE au.id = $1
    `,
      [id],
    );

    return NextResponse.json(
      {
        message: "User details fetched successfully",
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
