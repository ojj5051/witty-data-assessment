import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import argon2 from "argon2";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { password } = await request.json();

    const passwordHash = await argon2.hash(password);

    await pool.query(
      `
      UPDATE auth_password
      SET 
        password_hash = $2,
        password_updated_at = NOW()
      WHERE user_id = $1
      `,
      [id, passwordHash],
    );

    return NextResponse.json(
      {
        message: "User password updated successfully",
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
