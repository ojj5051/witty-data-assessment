import type { QueryClient } from "@/lib/db";

export async function importCategories(
  client: QueryClient,
  rateSetId: string,
  data: Record<string, unknown>[],
) {
  const categories = new Map<
    string,
    { number: unknown; name: unknown }
  >();

  data.forEach((row) => {
    const number = row["Support Category Number (PACE)"];

    if (number === undefined || number === null || categories.has(String(number))) {
      return;
    }

    categories.set(String(number), {
      number,
      name: row["Support Category Name (PACE)"],
    });
  });

  if (categories.size === 0) {
    throw new Error(
      "No support categories found. Check the Excel column headers.",
    );
  }

  let sorting = 1;

  for (const category of categories.values()) {
    await client.query(
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

  const result = await client.query(
    `
    SELECT id, category_number
    FROM rate_set_category
    WHERE rate_set_id = $1
    `,
    [rateSetId],
  );

  return new Map<string, number>(
    result.rows.map((row: { category_number: unknown; id: number }): [string, number] => [
      String(row.category_number),
      row.id,
    ]),
  );
}
