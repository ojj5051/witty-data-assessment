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
      SELECT *
      FROM invoice
      WHERE id = $1
    `,
      [id],
    );

    const items = await pool.query(
      `
      SELECT *
      FROM invoice_item
      WHERE invoice_id = $1
    `,
      [id],
    );

    return NextResponse.json(
      {
        message: "Invoice detail fetched successfully",
        data: {
          ...result.rows[0],
          items: items.rows,
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
