import express from "express";

import { createReviewRequest, getMyReviewRequest } from "../controller/suspensionReviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const suspensionReviewRouter = express.Router();

// `authenticate` (not `authMiddleware`) so suspended accounts can still reach
// these endpoints — this is their only available channel.
suspensionReviewRouter.post("/", authenticate, createReviewRequest);
suspensionReviewRouter.get("/mine", authenticate, getMyReviewRequest);

export default suspensionReviewRouter;