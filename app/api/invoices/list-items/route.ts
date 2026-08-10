import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const result = await pool.query(
      `SELECT
        rssi.id,
        rssi.item_number,
        rssi.item_name,
        rssi.unit,

        rs.id as rate_set_id,
        rs.start_date AS rate_set_start_date,
        rs.end_date AS rate_set_end_date,

        rsc.id AS category_id,
        rsc.category_number,
        rsc.category_name,

        json_object_agg(
          rssip.pricing_region_code,
          rssip.unit_price
        ) FILTER (
          WHERE rssip.pricing_region_code IS NOT NULL
        ) AS prices

      FROM rate_set_support_item rssi

      LEFT JOIN rate_set rs
        ON rssi.rate_set_id = rs.id

      LEFT JOIN rate_set_category rsc
        ON rssi.category_id = rsc.id

      LEFT JOIN rate_set_support_item_price rssip
        ON rssip.support_item_id = rssi.id
        AND rssip.rate_set_id = rs.id

      WHERE rs.start_date <= $1
        AND rs.end_date >= $2

      GROUP BY
        rs.id,
        rssi.id,
        rssi.item_number,
        rssi.item_name,
        rssi.unit,
        rs.start_date,
        rs.end_date,
        rsc.id,
        rsc.category_number,
        rsc.category_name,
        rsc.sorting,
        rssi.sorting

      ORDER BY
        rsc.sorting,
        rssi.sorting
    `,
      [startDate, endDate],
    );

    return NextResponse.json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch rate set support items:", error);

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
