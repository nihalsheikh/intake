import { Router } from "express";
import { insights, inbox } from "../controllers/insights.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

// Routes
router.get("/insights", insights);
router.get("/inbox", inbox);

export default router;
