import express from "express";

import { whatCouldIMake } from "../controller/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const aiRouter = express.Router();

aiRouter.post("/what-could-i-make", authMiddleware, whatCouldIMake);

export default aiRouter;