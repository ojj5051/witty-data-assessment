import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  const client = await pool.connect();

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "User id is required",
        },
        {
          status: 400,
        },
      );
    }

    await client.query("BEGIN");

    await client.query(
      `
      DELETE FROM auth_session
      WHERE user_id = $1
      `,
      [id],
    );

    await client.query(
      `
      DELETE FROM auth_password
      WHERE user_id = $1
      `,
      [id],
    );

    await client.query(
      `
      DELETE FROM rbac_user_role
      WHERE user_id = $1
      `,
      [id],
    );

    const result = await client.query(
      `
      DELETE FROM app_user
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
