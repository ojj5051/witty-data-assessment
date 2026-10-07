import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { pool, type QueryClient } from "@/lib/db";
import { importCategories } from "./importCategories";
import { importPrices } from "./importPrice";
import { importSupportItems } from "./importSupportItems";
import { parseExcel } from "./parseExcel";
import { deleteRateSetData } from "./deleteRateSetsData";

function importErrorMessage(error: unknown) {
  if (error instanceof Error && !("code" in error)) {
    return error.message;
  }

  return "Import failed";
}

export async function POST(request: Request) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  let client: (QueryClient & { release: () => void }) | null = null;

  try {
    const formData = await request.formData();
    const rateSetId = formData.get("rate_set_id");
    const file = formData.get("file");

    if (typeof rateSetId !== "string" || !rateSetId) {
      return NextResponse.json(
        { message: "Rate set is required." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "No file uploaded." },
        { status: 400 },
      );
    }

    const data = await parseExcel(file);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { message: "The Excel file has no rows to import." },
        { status: 400 },
      );
    }

    const db = (await pool.connect()) as QueryClient & { release: () => void };
    client = db;
    await db.query("BEGIN");

    const existing = await db.query(
      `
      SELECT id
      FROM rate_set_support_item
      WHERE rate_set_id = $1
      LIMIT 1
      `,
      [rateSetId],
    );

    if ((existing.rowCount ?? 0) > 0) {
      await deleteRateSetData(db, rateSetId);
    }

    const rows = data as Record<string, unknown>[];
    const categoryMap = await importCategories(db, rateSetId, rows);
    const supportItemMap = await importSupportItems(
      db,
      rateSetId,
      rows,
      categoryMap,
    );

    await importPrices(db, rateSetId, rows, supportItemMap);

    await db.query("COMMIT");

    return NextResponse.json({
      message: "Import successful.",
      count: data.length,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }

    console.error(error);

    return NextResponse.json(
      { message: importErrorMessage(error) },
      { status: 400 },
    );
  } finally {
    client?.release();
  }
}
