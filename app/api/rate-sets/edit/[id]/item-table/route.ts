import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(request, { params }) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  try {
    const { id } = await params;

    const rate_set_id = id;

    const result = await pool.query(
      `
      SELECT
          rate_set_category.category_number AS support_category_number,
          rate_set_category.category_name AS support_category_name,

          rate_set_support_item.item_number AS support_item_number,
          rate_set_support_item.item_name AS support_item_name,
          rate_set_support_item.unit,

          MAX(rate_set_support_item_type.label) AS type,

          MAX(rate_set_support_item_price.start_date) AS start_date,
          MAX(rate_set_support_item_price.end_date) AS end_date,


          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'ACT'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "ACT",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'NSW'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "NSW",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'NT'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "NT",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'QLD'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "QLD",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'SA'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "SA",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'TAS'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "TAS",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'VIC'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "VIC",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'WA'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "WA",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'REMOTE'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "REMOTE",

          MAX(
              CASE
                  WHEN rate_set_support_item_price.pricing_region_code = 'VERY_REMOTE'
                  THEN rate_set_support_item_price.unit_price
              END
          ) AS "VERY_REMOTE",


          BOOL_OR(
              CASE
                  WHEN rate_set_support_item_attribute_type.code = 'IS_QUOTE_REQUIRED'
                  THEN rate_set_support_item_attribute.value
                  ELSE false
              END
          ) AS "Quote",

          BOOL_OR(
              CASE
                  WHEN rate_set_support_item_attribute_type.code = 'IS_NF2F_SUPPORT_PROVISION'
                  THEN rate_set_support_item_attribute.value
                  ELSE false
              END
          ) AS "Non-Face-to-Face Support Provision",

          BOOL_OR(
              CASE
                  WHEN rate_set_support_item_attribute_type.code = 'IS_PROVIDER_TRAVEL'
                  THEN rate_set_support_item_attribute.value
                  ELSE false
              END
          ) AS "Provider Travel",

          BOOL_OR(
              CASE
                  WHEN rate_set_support_item_attribute_type.code = 'IS_SHORT_NOTICE_CANCEL'
                  THEN rate_set_support_item_attribute.value
                  ELSE false
              END
          ) AS "Short Notice Cancellations",

          BOOL_OR(
              CASE
                  WHEN rate_set_support_item_attribute_type.code = 'IS_NDIA_REQUESTED_REPORTS'
                  THEN rate_set_support_item_attribute.value
                  ELSE false
              END
          ) AS "NDIA Requested Reports",

          BOOL_OR(
              CASE
                  WHEN rate_set_support_item_attribute_type.code = 'IS_IRREGULAR_SIL_SUPPORTS'
                  THEN rate_set_support_item_attribute.value
                  ELSE false
              END
          ) AS "Irregular SIL Supports"


      FROM rate_set_category

      LEFT JOIN rate_set_support_item
          ON rate_set_support_item.category_id = rate_set_category.id

      LEFT JOIN rate_set_support_item_price
          ON rate_set_support_item_price.support_item_id = rate_set_support_item.id

      LEFT JOIN rate_set_support_item_type
          ON rate_set_support_item_type.id = rate_set_support_item_price.type_id

      LEFT JOIN rate_set_support_item_attribute
          ON rate_set_support_item_attribute.support_item_id = rate_set_support_item.id

      LEFT JOIN rate_set_support_item_attribute_type
          ON rate_set_support_item_attribute_type.code =
             rate_set_support_item_attribute.attribute_code


      WHERE rate_set_category.rate_set_id = $1


      GROUP BY
          rate_set_category.category_number,
          rate_set_category.category_name,

          rate_set_support_item.item_number,
          rate_set_support_item.item_name,
          rate_set_support_item.unit


      ORDER BY
          rate_set_category.category_number,
          rate_set_support_item.item_number
      `,
      [rate_set_id],
    );

    return NextResponse.json({
      data: result.rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Unable to fetch rate set items.",
          details: [error.message],
        },
      },
      {
        status: 400,
      },
    );
  }
}
