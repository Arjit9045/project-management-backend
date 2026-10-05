import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ProjectNote } from "../models/projectnote.models.js";
import { Task } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const memberships = await ProjectMember.find({ user: req.user._id }).populate("project");
  const projects = memberships.filter((m) => m.project).map((m) => ({ project: m.project, role: m.role }));
  return res.status(200).json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate("createdBy", "username fullName avatar");
  if (!project) throw new ApiError(404, "Project not found");
  const members = await ProjectMember.find({ project: project._id }).populate("user", "username fullName avatar email");
  return res.status(200).json(new ApiResponse(200, { project, members }, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({ name: req.body.name, description: req.body.description, createdBy: req.user._id });
  await ProjectMember.create({ user: req.user._id, project: project._id, role: UserRolesEnum.ADMIN });
  return res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.projectId, { name: req.body.name, description: req.body.description }, { new: true, runValidators: true });
  if (!project) throw new ApiError(404, "Project not found");
  return res.status(200).json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const id = req.params.projectId;
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw new ApiError(404, "Project not found");
  await Promise.all([ProjectMember.deleteMany({ project: id }), Task.deleteMany({ project: id }), ProjectNote.deleteMany({ project: id })]);
  return res.status(200).json(new ApiResponse(200, project, "Project deleted successfully"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, "User does not exist");
  const membership = await ProjectMember.findOneAndUpdate({ user: user._id, project: req.params.projectId }, { role: req.body.role }, { new: true, upsert: true, runValidators: true });
  return res.status(201).json(new ApiResponse(201, membership, "Project member added successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const members = await ProjectMember.find({ project: req.params.projectId }).populate("user", "username fullName avatar email");
  return res.status(200).json(new ApiResponse(200, members, "Project members fetched"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  if (!AvailableUserRole.includes(req.body.newRole)) throw new ApiError(400, "Invalid role");
  const membership = await ProjectMember.findOneAndUpdate({ project: req.params.projectId, user: req.params.userId }, { role: req.body.newRole }, { new: true, runValidators: true });
  if (!membership) throw new ApiError(404, "Project member not found");
  return res.status(200).json(new ApiResponse(200, membership, "Project member role updated successfully"));
});

const deleteMember = asyncHandler(async (req, res) => {
  const membership = await ProjectMember.findOne({ project: req.params.projectId, user: req.params.userId });
  if (!membership) throw new ApiError(404, "Project member not found");
  if (String(membership.user) === String(req.user._id)) throw new ApiError(400, "You cannot remove yourself from the project");
  await membership.deleteOne();
  return res.status(200).json(new ApiResponse(200, membership, "Project member deleted successfully"));
});

const addProjectNote = asyncHandler(async (req, res) => {
  const note = await ProjectNote.create({ project: req.params.projectId, createdBy: req.user._id, content: req.body.content });
  return res.status(201).json(new ApiResponse(201, note, "Project note created successfully"));
});
const getProjectNotes = asyncHandler(async (req, res) => {
  const notes = await ProjectNote.find({ project: req.params.projectId }).populate("createdBy", "username fullName avatar").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, notes, "Project notes fetched successfully"));
});
const deleteProjectNote = asyncHandler(async (req, res) => {
  const note = await ProjectNote.findOneAndDelete({ _id: req.params.noteId, project: req.params.projectId });
  if (!note) throw new ApiError(404, "Project note not found");
  if (String(note.createdBy) !== String(req.user._id) && req.user.role !== UserRolesEnum.ADMIN) throw new ApiError(403, "You cannot delete this note");
  return res.status(200).json(new ApiResponse(200, note, "Project note deleted successfully"));
});

export { addMembersToProject, createProject, deleteMember, getProjects, getProjectById, getProjectMembers, updateProject, deleteProject, updateMemberRole, addProjectNote, getProjectNotes, deleteProjectNote };
