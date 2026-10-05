import { ProjectNote } from "../models/projectnote.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";

export const createNote = asyncHandler(async (req, res) => {
  const note = await ProjectNote.create({ project: req.params.projectId, createdBy: req.user._id, content: req.body.content });
  return res.status(201).json(new ApiResponse(201, note, "Project note created successfully"));
});
export const getNotes = asyncHandler(async (req, res) => {
  const notes = await ProjectNote.find({ project: req.params.projectId }).populate("createdBy", "username fullName avatar").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, notes, "Project notes fetched successfully"));
});
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await ProjectNote.findOne({ _id: req.params.noteId, project: req.params.projectId });
  if (!note) throw new ApiError(404, "Project note not found");
  if (String(note.createdBy) !== String(req.user._id) && req.user.role !== UserRolesEnum.ADMIN) throw new ApiError(403, "You cannot delete this note");
  await note.deleteOne();
  return res.status(200).json(new ApiResponse(200, note, "Project note deleted successfully"));
});
