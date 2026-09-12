import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/apiResponses";
import {
  registerUser,
  loginUser,
  toPublicUser,
  updateProfile,
  changePassword,
} from "../services/auth.service";
import { deleteUser } from "../repositories/user.repo";

// Validates registration body, creates a new user account, and returns JWT session
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw ApiError.badRequest("Name, email, and password are required");
  }

  const { user, token } = await registerUser({ name, email, password });
  sendSuccess(res, {
    statusCode: 201,
    message: "Account created successfully",
    data: { user, token },
  });
});

// Authenticates credentials and issues a JWT token for valid logins
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }

  const { user, token } = await loginUser({ email, password });
  sendSuccess(res, {
    message: "Logged in successfully",
    data: { user, token },
  });
});

// Returns the authenticated user's profile
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, {
    data: { user: toPublicUser(req.user!) },
  });
});

// Modifies profile fields such as name and avatar color for the active session
export const patchProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await updateProfile(req.user!._id, req.body);
    sendSuccess(res, {
      message: "Profile updated",
      data: { user },
    });
  },
);

// Verifies current password and updates the account with a new password hash
export const patchPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await changePassword(req.user!._id, req.body);
    sendSuccess(res, {
      message: "Password changed",
    });
  },
);

// Permanently removes the authenticated user and cascade-deletes their data
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteUser(req.user!._id);
    sendSuccess(res, {
      message: "Account deleted",
    });
  },
);
