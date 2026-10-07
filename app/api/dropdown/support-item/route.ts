import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const { searchParams } = new URL(request.url);

    const category_id = searchParams.get("category_id");

    let query: string;
    let params: any[] = [];

    if (category_id) {
      query = `
        SELECT DISTINCT ON (item_number)
          id,
          item_number,
          item_name,
          category_id
        FROM rate_set_support_item
        WHERE category_id = $1
        ORDER BY item_number, id
      `;
      params = [category_id];
    } else {

      query = `
        SELECT DISTINCT ON (item_number)
          id,
          item_number,
          item_name,
          category_id
        FROM rate_set_support_item
        ORDER BY item_number, id
      `;
    }

    const result = await pool.query(query, params);

    return NextResponse.json({
      data: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to load support items.",
          details: [error.message],
        },
      },
      {
        status: 500,
      },
    );
  }
}