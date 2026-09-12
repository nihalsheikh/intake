import { Router } from "express";
import {
  generateForm,
  generateValidation,
  improveQuestion,
  formSummary,
} from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

// Routes
router.post("/generate-form", generateForm);
router.post("/generate-validation", generateValidation);
router.post("/improve-question", improveQuestion);
router.post("/form-summary", formSummary);

export default router;
