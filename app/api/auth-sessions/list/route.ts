import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        s.*,
        u.full_name AS user_name,
        r.label AS role_name,
        r.code AS role_code
      FROM public.auth_session s
      LEFT JOIN public.app_user u
        ON u.id = s.user_id
      LEFT JOIN public.rbac_role r
        ON r.id = s.role_id
      ORDER BY s.created_at DESC;
    `);

    return NextResponse.json(
      {
        message: "Auth Sessions fetched successfully",
        data: result.rows,
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
