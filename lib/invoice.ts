import BigNumber from "bignumber.js";
import type { QueryClient } from "@/lib/db";

export class InvoiceValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type PreparedInvoiceItem = {
  rate_set_id: string;
  start_date: string;
  end_date: string;
  category_id: string;
  support_item_id: string;
  unit: string;
  input_rate: string;
  amount: string;
  max_rate: string;
};

export type PreparedInvoice = {
  client_id: string;
  provider_id: string;
  invoice_number: string;
  status: "draft" | "completed";
  invoice_date: string;
  expected_amount: string;
  amount: string;
  items: PreparedInvoiceItem[];
};

type InvoiceBody = {
  client_id?: unknown;
  provider_id?: unknown;
  invoice_number?: unknown;
  status?: unknown;
  invoice_date?: unknown;
  expected_amount?: unknown;
  items?: unknown;
};

type ItemBody = {
  start_date?: unknown;
  end_date?: unknown;
  support_item_id?: unknown;
  unit?: unknown;
  input_rate?: unknown;
  category_id?: unknown;
};

function toDateOnly(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  if (iso) return iso[1];

  const dayFirst = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (dayFirst) return `${dayFirst[3]}-${dayFirst[2]}-${dayFirst[1]}`;

  return null;
}

function isBlankItem(item: ItemBody) {
  return (
    !item.support_item_id &&
    !item.start_date &&
    !item.end_date &&
    (item.unit === undefined || item.unit === null || item.unit === "") &&
    (item.input_rate === undefined ||
      item.input_rate === null ||
      item.input_rate === "") &&
    !item.category_id
  );
}

function money(value: BigNumber) {
  return value.decimalPlaces(2, BigNumber.ROUND_HALF_UP);
}

export async function prepareInvoice(
  client: QueryClient,
  input: unknown,
): Promise<PreparedInvoice> {
  const body = (input ?? {}) as InvoiceBody;
  const invoiceNumber =
    typeof body.invoice_number === "string" ? body.invoice_number.trim() : "";
  const invoiceDate = toDateOnly(
    typeof body.invoice_date === "string" ? body.invoice_date : null,
  );
  const isDraft = body.status === "draft";

  if (!body.client_id || !body.provider_id || !invoiceNumber || !invoiceDate) {
    throw new InvoiceValidationError(
      "Participant, provider, invoice number, and invoice date are required",
    );
  }

  const participant = await client.query(
    `
    SELECT pricing_region
    FROM client
    WHERE id = $1
      AND deleted_at IS NULL
    `,
    [body.client_id],
  );

  if (participant.rowCount === 0) {
    throw new InvoiceValidationError("Participant not found", 404);
  }

  const pricingRegion = participant.rows[0].pricing_region as string | null;

  if (!pricingRegion) {
    throw new InvoiceValidationError(
      "Participant does not have a pricing region",
    );
  }

  const provider = await client.query(
    `
    SELECT id
    FROM provider
    WHERE id = $1
      AND deleted_at IS NULL
    `,
    [body.provider_id],
  );

  if (provider.rowCount === 0) {
    throw new InvoiceValidationError("Provider not found", 404);
  }

  const rawItems = Array.isArray(body.items) ? (body.items as ItemBody[]) : [];
  const items = rawItems.filter((item) => item && !isBlankItem(item));

  if (!isDraft && items.length === 0) {
    throw new InvoiceValidationError("At least one invoice item is required");
  }

  const prepared: PreparedInvoiceItem[] = [];
  let total = new BigNumber(0);

  for (const item of items) {
    const startDate = toDateOnly(
      typeof item.start_date === "string" ? item.start_date : null,
    );
    const endDate = toDateOnly(
      typeof item.end_date === "string" ? item.end_date : null,
    );

    if (!item.support_item_id || !startDate || !endDate) {
      throw new InvoiceValidationError(
        "Each item needs a support item and service dates",
      );
    }

    if (startDate > endDate) {
      throw new InvoiceValidationError(
        "Service start date must be on or before the end date",
      );
    }

    const priceResult = await client.query(
      `
      SELECT
        rssip.unit_price,
        rssi.rate_set_id,
        rssi.category_id
      FROM rate_set_support_item rssi
      JOIN rate_set rs
        ON rs.id = rssi.rate_set_id
      JOIN rate_set_support_item_price rssip
        ON rssip.support_item_id = rssi.id
        AND rssip.rate_set_id = rs.id
        AND rssip.pricing_region_code = $2
      WHERE rssi.id = $1
        AND rs.start_date <= $3::date
        AND rs.end_date >= $4::date
        AND rssip.start_date <= $4::date
        AND rssip.end_date >= $3::date
      `,
      [item.support_item_id, pricingRegion, startDate, endDate],
    );

    if (priceResult.rowCount === 0) {
      throw new InvoiceValidationError(
        "No price found for this support item, pricing region, and service dates",
      );
    }

    const unitPrices = priceResult.rows.map(
      (row: { unit_price: BigNumber.Value }) => new BigNumber(row.unit_price),
    );
    const maxRate = unitPrices[0];

    if (
      !maxRate.isFinite() ||
      unitPrices.some(
        (price: BigNumber) => !price.isFinite() || !price.eq(maxRate),
      )
    ) {
      throw new InvoiceValidationError(
        "Multiple prices found for this support item and region",
      );
    }

    const unit = new BigNumber(
      item.unit === undefined || item.unit === null || item.unit === ""
        ? NaN
        : (item.unit as BigNumber.Value),
    );
    const inputRate = new BigNumber(
      item.input_rate === undefined ||
        item.input_rate === null ||
        item.input_rate === ""
        ? NaN
        : (item.input_rate as BigNumber.Value),
    );

    if (!unit.isFinite() || unit.lte(0)) {
      throw new InvoiceValidationError("Unit must be greater than zero");
    }

    if (!inputRate.isFinite() || inputRate.lt(0)) {
      throw new InvoiceValidationError("Invoice rate must be zero or greater");
    }

    if (!isDraft && inputRate.gt(maxRate)) {
      throw new InvoiceValidationError(
        "Invoice rate cannot exceed the price guide rate",
      );
    }

    const amount = money(unit.times(inputRate));
    total = total.plus(amount);

    prepared.push({
      rate_set_id: priceResult.rows[0].rate_set_id,
      start_date: startDate,
      end_date: endDate,
      category_id: priceResult.rows[0].category_id,
      support_item_id: String(item.support_item_id),
      unit: unit.toFixed(),
      input_rate: inputRate.toFixed(),
      amount: amount.toFixed(2),
      max_rate: maxRate.toFixed(),
    });
  }

  total = money(total);

  let expectedAmount = total;
  if (isDraft && body.expected_amount !== undefined && body.expected_amount !== "") {
    expectedAmount = new BigNumber(body.expected_amount as BigNumber.Value);
    if (!expectedAmount.isFinite()) {
      throw new InvoiceValidationError("Expected amount must be a number");
    }
    expectedAmount = money(expectedAmount);
  }

  if (!isDraft) {
    const expected = new BigNumber(
      body.expected_amount === undefined || body.expected_amount === ""
        ? NaN
        : (body.expected_amount as BigNumber.Value),
    );

    if (!expected.isFinite() || !money(expected).eq(total)) {
      throw new InvoiceValidationError(
        "Expected amount must equal the calculated amount",
      );
    }
  }

  return {
    client_id: String(body.client_id),
    provider_id: String(body.provider_id),
    invoice_number: invoiceNumber,
    status: isDraft ? "draft" : "completed",
    invoice_date: invoiceDate,
    expected_amount: expectedAmount.toFixed(2),
    amount: total.toFixed(2),
    items: prepared,
  };
}
