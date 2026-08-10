import { NextResponse } from "next/server";

import { importCategories } from "./importCategories";
import { importPrices } from "./importPrice";
import { importSupportItems } from "./importSupportItems";
import { parseExcel } from "./parseExcel";
import { deleteRateSetData } from "./deleteRateSetsData";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const formData = await request.formData();

    const rateSetId = formData.get("rate_set_id") as string;
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded." },
        { status: 400 },
      );
    }

    const data = await parseExcel(file);

    await client.query("BEGIN");

    const existing = await pool.query(
      `
      SELECT id
      FROM rate_set_support_item
      WHERE rate_set_id = $1
      LIMIT 1
      `,
      [rateSetId],
    );

    if (existing.rowCount > 0) {
      await deleteRateSetData(rateSetId);
    }
    
    const categoryMap = await importCategories(rateSetId, data);

    const supportItemMap = await importSupportItems(
      rateSetId,
      data,
      categoryMap,
    );

    await importPrices(rateSetId, data, supportItemMap);

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Import successful.",
      count: data.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more fields are invalid.",
          details: [error.message],
        },
      },
      { status: 400 },
    );
  }
}
