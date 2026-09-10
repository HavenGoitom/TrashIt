import express from "express";

import {
    reportPost,
    reportUser,
    getMyReports
} from "../controller/reportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const reportRouter = express.Router();

reportRouter.post("/post/:postId", authMiddleware, reportPost);
reportRouter.post("/user/:userId", authMiddleware, reportUser);
reportRouter.get("/my", authMiddleware, getMyReports);

export default reportRouter;