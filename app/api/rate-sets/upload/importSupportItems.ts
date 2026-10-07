import type { QueryClient } from "@/lib/db";

const attributeColumns: Record<string, string> = {
  IS_QUOTE_REQUIRED: "Quote",
  IS_NF2F_SUPPORT_PROVISION: "Non-Face-to-Face Support Provision",
  IS_PROVIDER_TRAVEL: "Provider Travel",
  IS_SHORT_NOTICE_CANCEL: "Short Notice Cancellations.",
  IS_NDIA_REQUESTED_REPORTS: "NDIA Requested Reports",
};

export async function importSupportItems(
  client: QueryClient,
  rateSetId: string,
  data: Record<string, unknown>[],
  categoryMap: Map<string, number>,
) {
  const attributes = await client.query(
    `
    SELECT code
    FROM rate_set_support_item_attribute_type
    `,
  );

  const supportItemMap = new Map<unknown, unknown>();
  let sorting = 1;

  for (const row of data) {
    const categoryId = categoryMap.get(
      String(row["Support Category Number (PACE)"]),
    );

    if (!categoryId || supportItemMap.has(row["Support Item Number"])) continue;

    const result = await client.query(
      `
      INSERT INTO rate_set_support_item
      (
        rate_set_id,
        category_id,
        item_number,
        item_name,
        unit,
        sorting
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id
      `,
      [
        rateSetId,
        categoryId,
        row["Support Item Number"],
        row["Support Item Name"],
        row["Unit"],
        sorting,
      ],
    );

    const supportItemId = result.rows[0].id;
    supportItemMap.set(row["Support Item Number"], supportItemId);

    for (const attribute of attributes.rows) {
      const column = attributeColumns[attribute.code];

      if (!column) continue;

      const value = ["yes", "y"].includes(
        String(row[column] ?? "").toLowerCase(),
      );

      await client.query(
        `
        INSERT INTO rate_set_support_item_attribute
        (
          support_item_id,
          attribute_code,
          value
        )
        VALUES ($1,$2,$3)
        ON CONFLICT (support_item_id, attribute_code)
        DO UPDATE SET value = EXCLUDED.value
        `,
        [supportItemId, attribute.code, value],
      );
    }

    sorting++;
  }

  if (supportItemMap.size === 0) {
    throw new Error(
      "No support items found. Check the Excel column headers.",
    );
  }

  return supportItemMap;
}
