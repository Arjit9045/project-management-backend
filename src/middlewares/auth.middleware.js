import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new ApiError(401, "Unauthorized request");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry");
    if (!user) throw new ApiError(401, "Invalid access token");
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid access token");
  }
});

export const validateProjectPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId || !mongoose.isValidObjectId(projectId)) throw new ApiError(400, "Invalid project id");

    const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
    if (!membership) throw new ApiError(403, "You are not a member of this project");

    req.user.role = membership.role;
    if (roles.length && !roles.includes(membership.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  });
