import express from "express";

import { getMyMatches } from "../controller/matchController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const matchRouter = express.Router();

matchRouter.get("/", authMiddleware, getMyMatches);

export default matchRouter;