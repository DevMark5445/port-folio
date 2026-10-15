import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  reorderProjects,
  updateProject,
} from "../controllers/projectController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", listProjects);
router.get("/:id", getProject);
router.use(requireAuth);
router.patch("/reorder", reorderProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
