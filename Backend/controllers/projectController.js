import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import Project from "../models/Project.js";
import { validateProjectPayload } from "../utils/validateProject.js";

export async function listProjects(_request, response, next) {
  try {
    response.json(await Project.find().sort({ sort_order: 1, createdAt: -1 }));
  } catch (error) {
    next(error);
  }
}

export async function getProject(request, response, next) {
  try {
    const project = await Project.findById(request.params.id);
    if (!project) {
      throw new ApiError(404, "Project not found.");
    }
    response.json(project);
  } catch (error) {
    next(error);
  }
}

export async function createProject(request, response, next) {
  try {
    const fields = validateProjectPayload(request.body);
    if (fields.sort_order === undefined) {
      const highestOrder = await Project.findOne().sort({ sort_order: -1 }).select("sort_order");
      fields.sort_order = highestOrder ? highestOrder.sort_order + 1 : 0;
    }
    response.status(201).json(await Project.create(fields));
  } catch (error) {
    next(error);
  }
}

export async function updateProject(request, response, next) {
  try {
    const updates = validateProjectPayload(request.body, { partial: true });
    const project = await Project.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      throw new ApiError(404, "Project not found.");
    }
    response.json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(request, response, next) {
  try {
    const project = await Project.findByIdAndDelete(request.params.id);
    if (!project) {
      throw new ApiError(404, "Project not found.");
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
}

export async function reorderProjects(request, response, next) {
  try {
    const { order } = request.body || {};
    if (!Array.isArray(order) || order.some((id) => typeof id !== "string" || !mongoose.isValidObjectId(id))) {
      throw new ApiError(400, "order must be an array of valid project IDs.");
    }
    if (new Set(order).size !== order.length) {
      throw new ApiError(400, "Each project ID may appear only once in the order.");
    }

    const projects = await Project.find({ _id: { $in: order } }).select("_id");
    if (projects.length !== order.length) {
      throw new ApiError(400, "The order must contain existing project IDs.");
    }

    await Project.bulkWrite(order.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sort_order: index } },
      },
    })));
    response.json(await Project.find().sort({ sort_order: 1, createdAt: -1 }));
  } catch (error) {
    next(error);
  }
}
