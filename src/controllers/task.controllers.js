import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new ApiError(404, "Project not found");
  const tasks = await Task.find({ project: req.params.projectId }).populate("assignedTo", "avatar username fullName").populate("assignedBy", "avatar username fullName").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!(await Project.exists({ _id: projectId }))) throw new ApiError(404, "Project not found");
  if (req.body.assignedTo && !(await ProjectMember.exists({ project: projectId, user: req.body.assignedTo }))) throw new ApiError(400, "Assigned user is not a member of this project");
  const attachments = (req.files || []).map((file) => ({ url: `${process.env.SERVER_URL || "http://localhost:3000"}/images/${encodeURIComponent(file.filename)}`, mimetype: file.mimetype, size: file.size }));
  const task = await Task.create({ title: req.body.title, description: req.body.description, project: projectId, assignedTo: req.body.assignedTo || undefined, status: req.body.status, assignedBy: req.user._id, attachments });
  return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.params.projectId }).populate("assignedTo", "username fullName avatar email").populate("assignedBy", "username fullName avatar email");
  if (!task) throw new ApiError(404, "Task not found");
  const subtasks = await Subtask.find({ task: task._id }).populate("createdBy", "username fullName avatar").sort({ createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, { task, subtasks }, "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.params.projectId });
  if (!task) throw new ApiError(404, "Task not found");
  if (req.body.assignedTo && !(await ProjectMember.exists({ project: req.params.projectId, user: req.body.assignedTo }))) throw new ApiError(400, "Assigned user is not a member of this project");
  for (const key of ["title", "description", "status", "assignedTo"]) if (Object.prototype.hasOwnProperty.call(req.body, key)) task[key] = req.body[key] || undefined;
  if (req.files?.length) task.attachments.push(...req.files.map((file) => ({ url: `${process.env.SERVER_URL || "http://localhost:3000"}/images/${encodeURIComponent(file.filename)}`, mimetype: file.mimetype, size: file.size })));
  await task.save();
  return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.taskId, project: req.params.projectId });
  if (!task) throw new ApiError(404, "Task not found");
  await Subtask.deleteMany({ task: task._id });
  return res.status(200).json(new ApiResponse(200, task, "Task deleted successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.params.projectId });
  if (!task) throw new ApiError(404, "Task not found");
  const subtask = await Subtask.create({ title: req.body.title, task: task._id, createdBy: req.user._id });
  return res.status(201).json(new ApiResponse(201, subtask, "Subtask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.params.projectId });
  if (!task) throw new ApiError(404, "Task not found");
  const subtask = await Subtask.findOne({ _id: req.params.subTaskId, task: task._id });
  if (!subtask) throw new ApiError(404, "Subtask not found");
  if (req.body.title !== undefined) subtask.title = req.body.title;
  if (req.body.isCompleted !== undefined) subtask.isCompleted = req.body.isCompleted;
  await subtask.save();
  return res.status(200).json(new ApiResponse(200, subtask, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, project: req.params.projectId });
  if (!task) throw new ApiError(404, "Task not found");
  const subtask = await Subtask.findOneAndDelete({ _id: req.params.subTaskId, task: task._id });
  if (!subtask) throw new ApiError(404, "Subtask not found");
  return res.status(200).json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
});

export { createSubTask, createTask, deleteTask, deleteSubTask, getTaskById, getTasks, updateSubTask, updateTask };
