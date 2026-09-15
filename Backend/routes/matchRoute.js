import express from "express";

import { getMyMatches, getMatchById, refreshMatches } from "../controller/matchController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const matchRouter = express.Router();

matchRouter.get("/", authMiddleware, getMyMatches);
matchRouter.post("/refresh", authMiddleware, refreshMatches);
matchRouter.get("/:id", authMiddleware, getMatchById);

export default matchRouter;
