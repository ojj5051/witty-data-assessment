import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function DELETE(request: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  const client = await pool.connect();

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          message: "Rate set id is required",
        },
        {
          status: 400,
        },
      );
    }

    await client.query("BEGIN");

    // Delete attributes
    await client.query(
      `
      DELETE FROM rate_set_support_item_attribute
      WHERE support_item_id IN (
        SELECT id
        FROM rate_set_support_item
        WHERE rate_set_id = $1
      )
      `,
      [id],
    );

    // Delete prices
    await client.query(
      `
      DELETE FROM rate_set_support_item_price
      WHERE rate_set_id = $1
      `,
      [id],
    );

    // Delete support items
    await client.query(
      `
      DELETE FROM rate_set_support_item
      WHERE rate_set_id = $1
      `,
      [id],
    );

    // Delete categories
    await client.query(
      `
      DELETE FROM rate_set_category
      WHERE rate_set_id = $1
      `,
      [id],
    );

    // Delete rate set
    const result = await client.query(
      `
      DELETE FROM rate_set
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new Error("Rate set not found");
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Rate set deleted successfully",
    });
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
          details: [error.message],
        },
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
