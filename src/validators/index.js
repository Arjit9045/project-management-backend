import { body } from "express-validator";
import { AvailableUserRole, AvailableTaskStatues } from "../utils/constants.js";

export const userRegisterValidator = () => [
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Email is invalid"),
  body("username").trim().notEmpty().withMessage("Username is required").isLowercase().withMessage("Username must be in lower case").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
  body("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("fullName").optional().trim(),
];
export const userLoginValidator = () => [body("email").trim().isEmail().withMessage("Email is invalid"), body("password").notEmpty().withMessage("Password is required")];
export const userChangeCurrentPasswordValidator = () => [body("oldPassword").notEmpty().withMessage("Old password is required"), body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long")];
export const userForgotPasswordValidator = () => [body("email").notEmpty().isEmail().withMessage("Email is invalid")];
export const userResetForgotPasswordValidator = () => [body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")];
export const createProjectValidator = () => [body("name").trim().notEmpty().withMessage("Name is required"), body("description").optional().trim()];
export const addMembertoProjectValidator = () => [body("email").trim().notEmpty().isEmail().withMessage("Email is invalid"), body("role").notEmpty().isIn(AvailableUserRole).withMessage("Role is invalid")];
export const createTaskValidator = () => [body("title").trim().notEmpty().withMessage("Title is required"), body("description").optional().trim(), body("assignedTo").optional().isMongoId().withMessage("assignedTo is invalid"), body("status").optional().isIn(AvailableTaskStatues).withMessage("Invalid task status")];
export const updateTaskValidator = () => [body("title").optional().trim().notEmpty(), body("description").optional().trim(), body("assignedTo").optional({ nullable: true }).isMongoId(), body("status").optional().isIn(AvailableTaskStatues)];
export const createSubtaskValidator = () => [body("title").trim().notEmpty().withMessage("Title is required")];
export const updateSubtaskValidator = () => [body("title").optional().trim().notEmpty(), body("isCompleted").optional().isBoolean().withMessage("isCompleted must be boolean")];
export const updateMemberRoleValidator = () => [body("newRole").notEmpty().isIn(AvailableUserRole).withMessage("Invalid role")];
export const createNoteValidator = () => [body("content").trim().notEmpty().withMessage("Content is required")];
