import { pool } from "@/lib/db";

const attributeColumns: Record<string, string> = {
  IS_QUOTE_REQUIRED: "Quote",
  IS_NF2F_SUPPORT_PROVISION: "Non-Face-to-Face Support Provision",
  IS_PROVIDER_TRAVEL: "Provider Travel",
  IS_SHORT_NOTICE_CANCEL: "Short Notice Cancellations.",
  IS_NDIA_REQUESTED_REPORTS: "NDIA Requested Reports",
};

export async function importSupportItems(
  rate_set_id: string,
  data: any[],
  categoryMap: Map<string, number>,
) {
  const attributes = await pool.query(
    `
    SELECT code
    FROM rate_set_support_item_attribute_type
    `,
  );

  const supportItemMap = new Map();

  let sorting = 1;

  for (const row of data) {
    const categoryId = categoryMap.get(
      String(row["Support Category Number (PACE)"]),
    );

    if (!categoryId) continue;

    const existing = await pool.query(
      `
  SELECT id
  FROM rate_set_support_item
  WHERE rate_set_id = $1
  AND item_number = $2
  `,
      [rate_set_id, row["Support Item Number"]],
    );

    let supportItemId;

    if (existing.rowCount) {
      supportItemId = existing.rows[0].id;

      await pool.query(
        `
    UPDATE rate_set_support_item
    SET
      category_id = $1,
      item_name = $2,
      unit = $3,
      sorting = $4,
      updated_at = NOW()
    WHERE id = $5
    `,
        [
          categoryId,
          row["Support Item Name"],
          row["Unit"],
          sorting,
          supportItemId,
        ],
      );
    } else {
      const result = await pool.query(
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
          rate_set_id,
          categoryId,
          row["Support Item Number"],
          row["Support Item Name"],
          row["Unit"],
          sorting,
        ],
      );

      supportItemId = result.rows[0].id;
    }

    supportItemMap.set(row["Support Item Number"], supportItemId);

    for (const attribute of attributes.rows) {
      const column = attributeColumns[attribute.code];

      if (!column) continue;

      const value = ["yes", "y"].includes(String(row[column]).toLowerCase());

      await pool.query(
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

  return supportItemMap;
}
