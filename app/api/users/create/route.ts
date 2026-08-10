import argon2 from "argon2";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const { email, full_name, password, role_id } = await request.json();

    if (!email || !full_name || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, full name and password are required",
        },
        { status: 400 },
      );
    }

    await client.query("BEGIN");

    // Check if email already exists
    const existingUser = await client.query(
      `
      SELECT id
      FROM public.app_user
      WHERE LOWER(email) = LOWER($1)
      `,
      [email],
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 409 },
      );
    }

    // Create user
    const userResult = await client.query(
      `
      INSERT INTO public.app_user (
        email,
        full_name
      )
      VALUES ($1, $2)
      RETURNING id, email, full_name
      `,
      [email.toLowerCase().trim(), full_name.trim()],
    );

    const user = userResult.rows[0];

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create password record
    await client.query(
      `
      INSERT INTO public.auth_password (
        user_id,
        password_hash,
        password_updated_at
      )
      VALUES ($1, $2, NOW())
      `,
      [user.id, passwordHash],
    );

    // Create role
    if (role_id) {
      await client.query(
        `
        INSERT INTO public.rbac_user_role (
          user_id,
          role_id
        )
        VALUES ($1, $2)
        `,
        [user.id, role_id],
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "User Created successful",
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
