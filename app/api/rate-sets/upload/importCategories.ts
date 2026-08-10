import { pool } from "@/lib/db";

export async function importCategories(rateSetId: string, data: any[]) {
  const categories = new Map();

  data.forEach((row: any) => {
    const number = row["Support Category Number (PACE)"];

    if (!categories.has(number)) {
      categories.set(number, {
        number,
        name: row["Support Category Name (PACE)"],
      });
    }
  });

  let sorting = 1;

  for (const category of categories.values()) {
    const existing = await pool.query(
      `
      SELECT id
      FROM rate_set_category
      WHERE rate_set_id=$1
      AND category_number=$2
      `,
      [rateSetId, category.number],
    );

    await pool.query(
      `
        INSERT INTO rate_set_category
        (
            rate_set_id,
            category_number,
            category_name,
            sorting
        )
        VALUES ($1,$2,$3,$4)
        `,
      [rateSetId, category.number, category.name, sorting],
    );

    sorting++;
  }

  const result = await pool.query(
    `
    SELECT id, category_number
    FROM rate_set_category
    WHERE rate_set_id=$1
    `,
    [rateSetId],
  );

  return new Map<string, number>(
    result.rows.map((r): [string, number] => [String(r.category_number), r.id]),
  );
}
