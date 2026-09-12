import { query } from "../config/db";

// Raw database row structure returned by PostgreSQL queries on the responses table
interface ResponseRow {
  id: string;
  form: string;
  answers: any;
  completion_time: number;
  meta: any;
  submitted_at: Date | string;
}

// Client-facing response object shape
export interface ResponseRecord {
  _id: string;
  form: string;
  answers: any[];
  completionTime: number;
  meta: Record<string, any>;
  submittedAt: Date | string;
}

// Input payload required to create a new form submission
export interface CreateResponseInput {
  form: string;
  answers?: any[];
  completionTime?: number;
  meta?: Record<string, any>;
  submittedAt?: Date | string;
}

// Transforms database snake_case fields into camelCase application models
export const mapResponse = (
  row?: ResponseRow | null,
): ResponseRecord | null => {
  if (!row) return null;
  return {
    _id: row.id,
    form: row.form,
    answers: row.answers || [],
    completionTime: row.completion_time,
    meta: row.meta || {},
    submittedAt: row.submitted_at,
  };
};

// Inserts a single form submission and returns the stored response record
export const createResponse = async ({
  form,
  answers,
  completionTime,
  meta,
}: CreateResponseInput): Promise<ResponseRecord | null> => {
  const { rows } = await query<ResponseRow>(
    `INSERT INTO responses (form, answers, completion_time, meta)
     VALUES ($1, $2::jsonb, $3, $4::jsonb) RETURNING *`,
    [
      form,
      JSON.stringify(answers || []),
      completionTime || 0,
      JSON.stringify(meta || {}),
    ],
  );
  return mapResponse(rows[0]);
};

// Batch inserts multiple form submissions concurrently using unnest for high throughput
export const insertManyResponses = async (
  docs: CreateResponseInput[],
): Promise<void> => {
  if (!docs.length) return;

  const forms = docs.map((d) => d.form);
  const answers = docs.map((d) => JSON.stringify(d.answers || []));
  const times = docs.map((d) => d.completionTime || 0);
  const metas = docs.map((d) => JSON.stringify(d.meta || {}));
  const submitted = docs.map((d) =>
    d.submittedAt
      ? new Date(d.submittedAt).toISOString()
      : new Date().toISOString(),
  );

  await query(
    `INSERT INTO responses (form, answers, completion_time, meta, submitted_at)
     SELECT * FROM UNNEST(
       $1::uuid[], $2::jsonb[], $3::int[], $4::jsonb[], $5::timestamptz[]
     )`,
    [forms, answers, times, metas, submitted],
  );
};

// Fetches recent submissions across multiple forms up to a specified limit
export const recentByForms = async (
  formIds: string[],
  limit: number = 300,
): Promise<(ResponseRecord | null)[]> => {
  if (!formIds.length) return [];

  const { rows } = await query<ResponseRow>(
    `SELECT * FROM responses WHERE form = ANY($1::uuid[])
     ORDER BY submitted_at DESC LIMIT $2`,
    [formIds, limit],
  );
  return rows.map(mapResponse);
};

// Retrieves all submissions for a single form ordered by submission date
export const listResponsesByForm = async (
  formId: string,
): Promise<(ResponseRecord | null)[]> => {
  const { rows } = await query<ResponseRow>(
    `SELECT * FROM responses WHERE form = $1 ORDER BY submitted_at DESC`,
    [formId],
  );
  return rows.map(mapResponse);
};

// Finds a submission by its unique identifier
export const findResponseById = async (
  id: string,
): Promise<ResponseRecord | null> => {
  const { rows } = await query<ResponseRow>(
    `SELECT * FROM responses WHERE id = $1`,
    [id],
  );
  return mapResponse(rows[0]);
};

// Permanently deletes an individual submission record
export const deleteResponse = async (id: string): Promise<void> => {
  await query(`DELETE FROM responses WHERE id = $1`, [id]);
};

// Aggregates submission counts grouped by calendar day for time series charts
export const timelineByForms = async (
  formIds: string[],
): Promise<{ date: string; count: number }[]> => {
  if (!formIds.length) return [];

  const { rows } = await query<{ date: string; count: number }>(
    `SELECT to_char(submitted_at, 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
     FROM responses WHERE form = ANY($1::uuid[])
     GROUP BY date ORDER BY date`,
    [formIds],
  );
  return rows;
};

// Calculates the average completion time in seconds across selected forms
export const avgCompletionByForms = async (
  formIds: string[],
): Promise<number> => {
  if (!formIds.length) return 0;

  const { rows } = await query<{ avg: number }>(
    `SELECT COALESCE(AVG(completion_time), 0)::float AS avg
     FROM responses WHERE form = ANY($1::uuid[])`,
    [formIds],
  );
  return Math.round(rows[0]?.avg || 0);
};

// Aggregates submission volume grouped by day of week and hour of day for heatmap grids
export const heatmapByForms = async (
  formIds: string[],
): Promise<{ day: number; hour: number; count: number }[]> => {
  if (!formIds.length) return [];

  const { rows } = await query<{ day: number; hour: number; count: number }>(
    `SELECT EXTRACT(DOW FROM submitted_at)::int AS day,
            EXTRACT(HOUR FROM submitted_at)::int AS hour,
            COUNT(*)::int AS count
     FROM responses WHERE form = ANY($1::uuid[])
     GROUP BY day, hour`,
    [formIds],
  );
  return rows;
};

// Groups submission counts by device category based on the stored user-agent string
export const devicesByForms = async (
  formIds: string[],
): Promise<{ label: string; value: number }[]> => {
  if (!formIds.length) return [];

  const { rows } = await query<{ label: string; value: number }>(
    `SELECT CASE
              WHEN meta->>'userAgent' ~* 'iPad|Tablet' THEN 'Tablet'
              WHEN meta->>'userAgent' ~* 'Android|iPhone|Mobile' THEN 'Mobile'
              ELSE 'Desktop'
            END AS label,
            COUNT(*)::int AS value
     FROM responses WHERE form = ANY($1::uuid[])
     GROUP BY label`,
    [formIds],
  );

  const order: Record<string, number> = { Desktop: 0, Mobile: 1, Tablet: 2 };
  return rows.sort((a, b) => (order[a.label] ?? 9) - (order[b.label] ?? 9));
};
