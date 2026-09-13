import express from "express";

import { whatCouldIMake, searchPosts } from "../controller/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const aiRouter = express.Router();

aiRouter.post("/what-could-i-make", authMiddleware, whatCouldIMake);
aiRouter.post("/search", authMiddleware, searchPosts);

export default aiRouter;