import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();

    const {
      ndis_number,
      gender_id,
      first_name,
      last_name,
      dob,
      email,
      phone_number,
      address,
      unit_building,
      pricing_region,
      deactivated_at,
    } = body;

    const result = await pool.query(
      `
      INSERT INTO client (
        ndis_number,
        gender_id,
        first_name,
        last_name,
        dob,
        email,
        phone_number,
        address,
        unit_building,
        pricing_region,
        deactivated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        ndis_number,
        gender_id,
        first_name,
        last_name,
        dob,
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
        message: "Participant created successfully",
        data: result.rows[0],
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: error.message,
        error,
      },
      { status: 500 },
    );
  }
}
