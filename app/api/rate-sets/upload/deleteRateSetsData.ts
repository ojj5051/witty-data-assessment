import type { QueryClient } from "@/lib/db";

export async function deleteRateSetData(
  client: QueryClient,
  rateSetId: string,
) {
  await client.query(
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

  await client.query(
    `
    DELETE FROM rate_set_support_item_price
    WHERE rate_set_id = $1
    `,
    [rateSetId],
  );

  await client.query(
    `
    DELETE FROM rate_set_support_item
    WHERE rate_set_id = $1
    `,
    [rateSetId],
  );

  await client.query(
    `
    DELETE FROM rate_set_category
    WHERE rate_set_id = $1
    `,
    [rateSetId],
  );
}
