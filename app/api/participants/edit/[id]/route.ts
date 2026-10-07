import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await params;

    console.log(id);

    const {
      first_name,
      last_name,
      gender_id,
      dob,
      ndis_number,
      email,
      phone_number,
      address,
      unit_building,
      pricing_region,
      deactivated_at,
    } = await request.json();

    const result = await pool.query(
      `
      UPDATE client
      SET first_name = $2,
        last_name = $3,
        gender_id = $4,
        dob = $5,
        ndis_number = $6,
        email = $7,
        phone_number = $8,
        address = $9,
        unit_building = $10,
        pricing_region = $11,
        deactivated_at = CASE
          WHEN $12 = true THEN NULL
          ELSE COALESCE(deactivated_at, NOW())
        END
      WHERE id = $1
    `,
      [
        id,
        first_name,
        last_name,
        gender_id,
        dob,
        ndis_number,
        email,
        phone_number,
        address,
        unit_building,
        pricing_region,
        deactivated_at,
      ],
    );

    return NextResponse.json(
      {
        message: "Participants fetched successfully",
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
