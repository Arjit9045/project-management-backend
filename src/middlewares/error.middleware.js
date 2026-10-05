import { ApiError } from "../utils/api-error.js";

export const errorHandler = (err, req, res, next) => {
  const error = err instanceof ApiError
    ? err
    : new ApiError(500, err?.message || "Internal server error");

  if (err?.name === "ValidationError") {
    error.statusCode = 400;
    error.message = "Validation failed";
    error.errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (err?.code === 11000) {
    error.statusCode = 409;
    error.message = `Duplicate value for ${Object.keys(err.keyPattern || {}).join(", ")}`;
  }

  if (err?.name === "CastError") {
    error.statusCode = 400;
    error.message = `Invalid ${err.path}`;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
  });
};
