import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type QueryResult = {
  rows: any[];
  rowCount: number | null;
};

export type QueryClient = {
  query: (
    text: string,
    values?: readonly unknown[],
  ) => Promise<QueryResult>;
};