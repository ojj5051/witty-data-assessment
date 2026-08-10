import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { label, code, permissions } = await req.json();

    const role = await pool.query(
      `
      INSERT INTO rbac_role (label, code)
      VALUES ($1, $2)
      RETURNING id
    `,
      [label, code],
    );

    const role_id = role.rows[0].id;

    const permissionResult = await pool.query(
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
  RETURNING permission_id
  `,
      [role_id, permissions],
    );


    return NextResponse.json(
      {
        message: "Roles created successfully",
      },
      { status: 200 },
    );
  } catch (error) {
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
