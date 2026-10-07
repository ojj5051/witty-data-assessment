import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { InvoiceValidationError, prepareInvoice } from "@/lib/invoice";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  let body: unknown;

  try {
    body = await request.json();
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

    const result = await client.query(
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
        invoice.client_id,
        invoice.provider_id,
        invoice.invoice_number,
        invoice.status,
        invoice.invoice_date,
        invoice.expected_amount,
        invoice.amount,
      ],
    );

    if (result.rowCount === 0) {
      throw new InvoiceValidationError("Invoice not found", 404);
    }

    await client.query(
      `
      DELETE FROM invoice_item
      WHERE invoice_id = $1
      `,
      [id],
    );

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
          id,
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
        message: "Invoice updated successfully",
        id,
      },
      { status: 200 },
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
      { message: "Failed to update invoice" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
