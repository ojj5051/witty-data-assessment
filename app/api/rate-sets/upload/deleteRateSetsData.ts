import { pool } from "@/lib/db";

export async function deleteRateSetData(rateSetId: string) {
  await pool.query(
    `
    DELETE FROM rate_set_support_item_attribute
    WHERE support_item_id IN (
      SELECT id
      FROM rate_set_support_item
      WHERE rate_set_id = $1
    )
    `,
    [rateSetId],
  );

  await pool.query(
    `
    DELETE FROM rate_set_support_item_price
    WHERE rate_set_id = $1
    `,
    [rateSetId],
  );

  await pool.query(
    `
    DELETE FROM rate_set_support_item
    WHERE rate_set_id = $1
    `,
    [rateSetId],
  );

  await pool.query(
    `
    DELETE FROM rate_set_category
    WHERE rate_set_id = $1
    `,
    [rateSetId],
  );
}
