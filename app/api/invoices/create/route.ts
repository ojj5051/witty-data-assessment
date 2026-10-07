import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { InvoiceValidationError, prepareInvoice } from "@/lib/invoice";

export async function POST(req: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const invoice = await prepareInvoice(client, body);

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
        invoice.client_id,
        invoice.provider_id,
        invoice.invoice_number,
        invoice.status,
        invoice.invoice_date,
        invoice.expected_amount,
        invoice.amount,
      ],
    );

    const invoiceId = invoiceResult.rows[0].id;

    for (const item of invoice.items) {
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

    if (error instanceof InvoiceValidationError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    console.error(error);

    return NextResponse.json(
      { message: "Failed to create invoice" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
