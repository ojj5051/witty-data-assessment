import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      client_id,
      provider_id,
      invoice_number,
      status,
      invoice_date,
      expected_amount,
      amount,
      items,
    } = body;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const invoiceResult = await client.query(
        `
        INSERT INTO invoice (
          client_id,
          provider_id,
          invoice_number,
          status,
          invoice_date,
          expected_amount,
          amount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `,
        [
          client_id,
          provider_id,
          invoice_number,
          status,
          invoice_date,
          expected_amount,
          amount,
        ],
      );

      const invoiceId = invoiceResult.rows[0].id;

      for (const item of items ?? []) {
        await client.query(
          `
          INSERT INTO invoice_item (
            invoice_id,
            rate_set_id,
            start_date,
            end_date,
            category_id,
            support_item_id,
            unit,
            input_rate,
            amount, 
            max_rate
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          `,
          [
            invoiceId,
            item.rate_set_id,
            item.start_date,
            item.end_date,
            item.category_id,
            item.support_item_id,
            item.unit,
            item.input_rate,
            item.amount,
            item.max_rate
          ],
        );
      }

      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          message: "Invoice created successfully",
          id: invoiceId,
        },
        { status: 201 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
