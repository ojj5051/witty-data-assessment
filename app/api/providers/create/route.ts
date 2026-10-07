import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();

    const {
      abn,
      name,
      name_parts,
      email,
      phone_number,
      address,
      unit_building,
    } = body;

    const result = await pool.query(
      `
      INSERT INTO provider (
        abn,
        name,
        name_parts,
        email,
        phone_number,
        address,
        unit_building
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [abn, name, name_parts, email, phone_number, address, unit_building],
    );

    return NextResponse.json(
      {
        message: "Provider created successfully",
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
        },
        {
          status: 500,
        },
      );
  }
}