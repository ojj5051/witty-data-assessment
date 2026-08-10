import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "User Role id is required",
        },
        {
          status: 400,
        },
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `
      DELETE FROM rbac_role
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new Error("User Role not found");
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "User Role deleted successfully",
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
