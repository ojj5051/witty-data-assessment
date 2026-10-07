import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import argon2 from "argon2";
import { requireUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await params;

    const { password } = await request.json();

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

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
        message: "Failed to update password",
      },
      {
        status: 500,
      },
    );
  }
}
