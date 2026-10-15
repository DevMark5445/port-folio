import { Router } from "express";
import authRoutes from "./authRoutes.js";
import githubRoutes from "./githubRoutes.js";
import projectRoutes from "./projectRoutes.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json({
    name: "Portfolio Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      projects: "/api/projects",
      github: "/api/github",
      health: "/api/health",
    },
  });
});

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/github", githubRoutes);

export default router;
