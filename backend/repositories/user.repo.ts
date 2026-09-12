import { query } from "../config/db";

// Raw row representation returned by PostgreSQL
interface UserRow {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar_color: string;
  created_at: Date | string;
}

// Client-facing user object structure
export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date | string;
}

// Formats snake_case database columns to match camelCase API conventions
const mapUser = (row?: UserRow | null): UserRecord | null => {
  if (!row) return null;

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
  };
};

// Inserts a new user record into Neon and returns the created profile
export const createUser = async ({
  name,
  email,
  password,
  avatarColor,
}: {
  name: string;
  email: string;
  password: string;
  avatarColor?: string;
}): Promise<UserRecord | null> => {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (name, email, password, avatar_color)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email.toLowerCase(), password, avatarColor || "#0c8b7c"],
  );

  return mapUser(rows[0]);
};

// Fetches an account by email, omitting the password hash by default
export const findUserByEmail = async (
  email: string,
  { withPassword = false }: { withPassword?: boolean } = {},
): Promise<UserRecord | null> => {
  const { rows } = await query<UserRow>(
    `SELECT * FROM users WHERE email = $1`,
    [email.toLowerCase()],
  );

  const user = mapUser(rows[0]);
  if (user && !withPassword) delete user.password;
  return user;
};

// Fetches an account by UUID, omitting the password hash by default
export const findUserById = async (
  id: string,
  { withPassword = false }: { withPassword?: boolean } = {},
): Promise<UserRecord | null> => {
  const { rows } = await query<UserRow>(`SELECT * FROM users WHERE id = $1`, [
    id,
  ]);

  const user = mapUser(rows[0]);
  if (user && !withPassword) delete user.password;
  return user;
};

// Updates editable profile fields
export const updateUserProfile = async (
  id: string,
  { name, avatarColor }: { name?: string; avatarColor?: string },
): Promise<UserRecord | null> => {
  const { rows } = await query<UserRow>(
    `UPDATE users SET
       name = COALESCE($2, name),
       avatar_color = COALESCE($3, avatar_color)
     WHERE id = $1 RETURNING *`,
    [id, name ?? null, avatarColor ?? null],
  );

  const user = mapUser(rows[0]);
  if (user) delete user.password;
  return user;
};

// Update user password
export const updateUserPassword = async (
  id: string,
  passwordHash: string,
): Promise<void> => {
  await query(`UPDATE users SET password = $2 WHERE id = $1`, [
    id,
    passwordHash,
  ]);
};

// Permanently deletes an account and cascade-removes its associated forms
export const deleteUser = async (id: string): Promise<void> => {
  await query(`DELETE FROM users WHERE id = $1`, [id]);
};
