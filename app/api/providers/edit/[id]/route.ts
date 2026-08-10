import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const {
      abn,
      name,
      email,
      phone_number,
      address,
      unit_building,
      deactivated_at,
    } = await request.json();

    const result = await pool.query(
      `
      UPDATE provider
      SET 
        abn = $2,
        name = $3,
        email = $4,
        phone_number = $5,
        address = $6,
        unit_building = $7,
        deactivated_at = CASE
          WHEN $8 = true THEN NULL
          ELSE COALESCE(deactivated_at, NOW())
        END
      WHERE id = $1
    `,
      [
        id,
        abn,
        name,
        email,
        phone_number,
        address,
        unit_building,
        deactivated_at,
      ],
    );

    return NextResponse.json(
      {
        message: "Provider edited successfully",
        data: result.rows,
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
