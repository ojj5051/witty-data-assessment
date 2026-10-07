import argon2 from "argon2";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    const result = await client.query(
      `
      SELECT
        au.id,
        au.email,
        au.full_name,
        ap.password_hash,
        rur.role_id
      FROM public.app_user au

      INNER JOIN public.auth_password ap
        ON ap.user_id = au.id

      LEFT JOIN public.rbac_user_role rur
        ON rur.user_id = au.id

      WHERE LOWER(au.email) = LOWER($1)
        AND au.deactivated_at IS NULL
      ORDER BY rur.role_id NULLS LAST
      LIMIT 1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    // Verify password
    const passwordValid = await argon2.verify(user.password_hash, password);

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");

    // Store only the hash in DB
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const userAgent = request.headers.get("user-agent") || null;

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    // Create session
    await client.query(
      `
      INSERT INTO public.auth_session (
        user_id,
        role_id,
        token_hash,
        user_agent,
        ip,
        expires_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW() + interval '7 days')
      `,
      [user.id, user.role_id, tokenHash, userAgent, ip],
    );

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role_id: user.role_id,
      },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        message: "Login failed",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
