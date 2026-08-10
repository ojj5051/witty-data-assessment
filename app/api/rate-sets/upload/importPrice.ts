import { pool } from "@/lib/db";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

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

export async function importPrices(
  rate_set_id: string,
  data: any[],
  supportItemMap: Map<any, any>,
) {
  dayjs.extend(customParseFormat);

  for (const row of data) {
    const typeResult = await pool.query(
      `
      SELECT id
      FROM rate_set_support_item_type
      WHERE label=$1
      `,
      [row["Type"]],
    );

    const supportItemId = supportItemMap.get(row["Support Item Number"]);

    //if (!supportItemId) continue;

    const typeId = typeResult.rowCount ? typeResult.rows[0].id : null;

    for (const region of pricingRegions) {
      const unitPrice = row[region];

      await pool.query(
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
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
        [
          rate_set_id,
          supportItemId,
          typeId,
          region.toUpperCase().replace(" ", "_"),
          unitPrice,
          dayjs(String(row["Start date"]), "YYYYMMDD").toDate(),
          dayjs(String(row["End Date"]), "YYYYMMDD").toDate(),
        ],
      );
    }
  }
}
