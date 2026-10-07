import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { QueryClient } from "@/lib/db";

dayjs.extend(customParseFormat);

const pricingRegions = [
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
  "Remote",
  "Very Remote",
];

function regionCode(region: string) {
  return region.toUpperCase().replaceAll(" ", "_");
}

function excelDate(value: unknown, label: string) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const parsed = dayjs(String(value), "YYYYMMDD", true);

  if (!parsed.isValid()) {
    throw new Error(`Invalid ${label}: ${String(value)}`);
  }

  return parsed.format("YYYY-MM-DD");
}

type PriceRow = {
  rateSetId: string;
  supportItemId: unknown;
  typeId: unknown;
  region: string;
  unitPrice: unknown;
  startDate: string | Date;
  endDate: string | Date;
};

export async function importPrices(
  client: QueryClient,
  rateSetId: string,
  data: Record<string, unknown>[],
  supportItemMap: Map<unknown, unknown>,
) {
  const typeResult = await client.query(
    `
    SELECT id, label
    FROM rate_set_support_item_type
    `,
  );

  const typeMap = new Map(
    typeResult.rows.map((row: { label: unknown; id: unknown }) => [
      row.label,
      row.id,
    ]),
  );

  const rows: PriceRow[] = [];

  for (const row of data) {
    const supportItemId = supportItemMap.get(row["Support Item Number"]);

    if (!supportItemId) continue;

    const startDate = excelDate(row["Start date"], "start date");
    const endDate = excelDate(row["End Date"], "end date");
    const typeId = typeMap.get(row["Type"]) ?? null;

    for (const region of pricingRegions) {
      const unitPrice = row[region];

      if (unitPrice === undefined || unitPrice === null || unitPrice === "") {
        continue;
      }

      rows.push({
        rateSetId,
        supportItemId,
        typeId,
        region: regionCode(region),
        unitPrice,
        startDate,
        endDate,
      });
    }
  }

  const chunkSize = 200;

  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    const values: unknown[] = [];

    const placeholders = chunk.map((row, index) => {
      const base = index * 7;
      values.push(
        row.rateSetId,
        row.supportItemId,
        row.typeId,
        row.region,
        row.unitPrice,
        row.startDate,
        row.endDate,
      );

      return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7})`;
    });

    await client.query(
      `
      INSERT INTO rate_set_support_item_price
      (
        rate_set_id,
        support_item_id,
        type_id,
        pricing_region_code,
        unit_price,
        start_date,
        end_date
      )
      VALUES ${placeholders.join(",")}
      `,
      values,
    );
  }
}
