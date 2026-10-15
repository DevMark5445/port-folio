import { Router } from "express";
import { fetchRepoDetails, importRepo } from "../controllers/githubController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/details", fetchRepoDetails);
router.post("/import", importRepo);

export default router;
