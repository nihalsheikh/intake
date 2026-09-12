import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/token";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  updateUserPassword,
  type UserRecord,
} from "../repositories/user.repo";

const AVATAR_COLORS = [
  "#0c8b7c",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#059669",
];

// User profile structure
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: Date | string;
}

// Authentication response containing public user info and JWT
export interface AuthResponse {
  user: PublicUser;
  token: string;
}

// Picks an avatar color using characters from the user's email
const pickAvatarColor = (seed: string): string => {
  const sum = [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]!;
};

// Remove sensitive fields like password hashes before sending user data to client
export const toPublicUser = (user: UserRecord): PublicUser => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
  };
};

// Validates input, hashes credentials, creates an account in Neon, and signs a JWT
export const registerUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  // Minimum length for display name
  if (name.trim().length < 2) {
    throw ApiError.badRequest("Name must be at least 2 characters");
  }

  // Validates standard email address syntax
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw ApiError.badRequest("Please provide a valid email");
  }

  // Minimum password complexity
  if (password.length < 6) {
    throw ApiError.badRequest("Password must be at least 6 characters");
  }

  // Prevents duplicate accounts with the same email
  const existing = await findUserByEmail(email);
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  // Hashes password using bcrypt with salt rounds of 10
  const hash = await bcrypt.hash(password, 10);

  // Inserts the user record into the database
  const user = await createUser({
    name: name.trim(),
    email,
    password: hash,
    avatarColor: pickAvatarColor(email),
  });

  if (!user) {
    throw ApiError.internal("Failed to create user account");
  }

  // Signs a JWT bearer token with the user's info
  const token = signToken({ id: user._id, email: user.email });
  return { user: toPublicUser(user), token };
};

// Verify email and matching password hash before generating a token
export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  // Get user along with their stored password hash
  const user = await findUserByEmail(email, { withPassword: true });
  if (!user || !user.password) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Compares plain-text entered password against the stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Generates fresh token on successful credentials check
  const token = signToken({ id: user._id, email: user.email });
  return { user: toPublicUser(user), token };
};

// Modify display name or avatar color for an authenticated account
export const updateProfile = async (
  userId: string,
  { name, avatarColor }: { name?: string; avatarColor?: string },
): Promise<PublicUser> => {
  // Updates user record in Neon and returns the refreshed profile
  const user = await updateUserProfile(userId, {
    name: name?.trim() || undefined,
    avatarColor,
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return toPublicUser(user);
};

// Change password
export const changePassword = async (
  userId: string,
  {
    currentPassword,
    newPassword,
  }: { currentPassword?: string; newPassword?: string },
): Promise<void> => {
  // Ensures both password arguments are provided
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest("Current and new password are required");
  }

  // Validates new password length
  if (newPassword.length < 6) {
    throw ApiError.badRequest("New password must be at least 6 characters");
  }

  // Loads current password hash from database for comparison
  const user = await findUserById(userId, { withPassword: true });
  if (!user || !user.password) {
    throw ApiError.notFound("User not found");
  }

  // Verifies the user knows their existing password before allowing an update
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  // Hashes the replacement password and commits it to the database
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(userId, passwordHash);
};
