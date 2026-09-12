import { Router } from "express";
import {
  submitResponse,
  getResponses,
  getAnalytics,
  deleteResponse,
  exportResponses,
} from "../controllers/response.controller";
import { getPublicForm } from "../controllers/form.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Fetch a published form schema by slug
router.get("/public/forms/:slug", getPublicForm);

// Submit answers for a published form
router.post("/public/forms/:slug/respond", submitResponse);

// Protected routes requiring authentication for form owners
router.get("/forms/:id/responses", protect, getResponses);
router.get("/forms/:id/responses/export", protect, exportResponses);
router.get("/forms/:id/analytics", protect, getAnalytics);
router.delete("/responses/:id", protect, deleteResponse);

export default router;
