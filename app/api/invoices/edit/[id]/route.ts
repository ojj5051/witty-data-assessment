import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const {
      client_id,
      provider_id,
      invoice_number,
      status,
      invoice_date,
      expected_amount,
      amount,
      items,
    } = await request.json();

    const result = await pool.query(
      `
      UPDATE invoice
      SET 
        client_id = $2,
        provider_id = $3,
        invoice_number = $4,
        status = $5,
        invoice_date = $6,
        expected_amount = $7,
        amount = $8
      WHERE id = $1
      RETURNING id
    `,
      [
        id,
        client_id,
        provider_id,
        invoice_number,
        status,
        invoice_date,
        expected_amount,
        amount,
      ],
    );

    const invoiceId = result.rows[0].id;

    const client = await pool.connect();

    await client.query(
      `
        DELETE FROM invoice_item
        WHERE invoice_id = $1
        `,
      [invoiceId],
    );

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
          item.max_rate,
        ],
      );
    }

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
