import pg, { type QueryResult, type QueryResultRow } from "pg";
import { env } from "./envConfig";

// Destructure the connection pool manager from the 'pg' library
const { Pool } = pg;

if (!env.databaseUrl) {
  console.error(
    "ERROR: DATABAE_URL is not set. Add your Neon connection string to environment variables",
  );
}

// Pool manages multiple reusable db connections instead of opening/closing every request
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: true, // Required by Neon to encrypt traffic in transit
  max: 10, // Maximum active connections open simultaneously in this pool
});

// Helper wrapper around pool.query with TypeScript for clean query execution
export const query = <T extends QueryResultRow = any>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

// Catch unexpected idle client errors in the pool so the server process doesn't crash
pool.on("error", (err: Error) => {
  console.error("ERROR: Postgres pool error:", err.message);
});

// Run scripts on startup to make sure all necessary tables exists in Neon
export const migrate = async (): Promise<void> => {
  // Enables the pgcrypto module needed for gen_random_uuid() cryptographic IDs
  await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Users table storing credentials, display name, and avatar settings
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name         text NOT NULL,
      email        text UNIQUE NOT NULL,
      password     text NOT NULL,
      avatar_color text NOT NULL DEFAULT '#0c8b7c',
      created_at   timestamptz NOT NULL DEFAULT now()
    );
  `);

  // Forms table storing schema, theme, styling, questions, and aggregate stats
  await query(`
    CREATE TABLE IF NOT EXISTS forms (
      id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title          text NOT NULL DEFAULT 'Untitled form',
      description    text NOT NULL DEFAULT '',
      theme          text NOT NULL DEFAULT 'modern',
      status         text NOT NULL DEFAULT 'draft',
      slug           text UNIQUE NOT NULL,
      questions      jsonb NOT NULL DEFAULT '[]'::jsonb,
      settings       jsonb NOT NULL DEFAULT '{}'::jsonb,
      views          integer NOT NULL DEFAULT 0,
      response_count integer NOT NULL DEFAULT 0,
      is_favorite    boolean NOT NULL DEFAULT false,
      is_archived    boolean NOT NULL DEFAULT false,
      published_at   timestamptz,
      created_at     timestamptz NOT NULL DEFAULT now(),
      updated_at     timestamptz NOT NULL DEFAULT now()
    );
  `);

  // Responses table storing respondent submissions for each form
  await query(`
    CREATE TABLE IF NOT EXISTS responses (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      form            uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      answers         jsonb NOT NULL DEFAULT '[]'::jsonb,
      completion_time integer NOT NULL DEFAULT 0,
      meta            jsonb NOT NULL DEFAULT '{}'::jsonb,
      submitted_at    timestamptz NOT NULL DEFAULT now()
    );
  `);

  // Composite index speeding up dashboard form lookups filtered by owner and archive status, sorted newest first
  await query(
    `CREATE INDEX IF NOT EXISTS idx_forms_owner ON forms(owner, is_archived, updated_at DESC);`,
  );

  // Composite index speeding up response list queries and exports filtered by form ID, sorted newest first
  await query(
    `CREATE INDEX IF NOT EXISTS idx_responses_form ON responses(form, submitted_at DESC);`,
  );
};

// Connect database
export const connectDB = async (): Promise<void> => {
  try {
    const { rows } = await query("SELECT current_database() AS db");
    console.log(`SUCCESS: Postgres connection success: ${rows[0].db}`);

    await migrate();
    console.log("Schema Ready");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("ERROR: Postgres connection error:", message);
    process.exit(1);
  }
};
