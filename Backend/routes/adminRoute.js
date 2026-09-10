import express from "express";

import {
    getUsers,
    getUser,
    suspendUser,
    unsuspendUser,
    getAllPosts,
    removePost,
    getReports,
    resolveReport,
    rejectReport,
    getStats
} from "../controller/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const adminRouter = express.Router();

// All routes require auth + admin role
adminRouter.use(authMiddleware, adminMiddleware);

// User management
adminRouter.get("/users", getUsers);
adminRouter.get("/users/:id", getUser);
adminRouter.patch("/users/:id/suspend", suspendUser);
adminRouter.patch("/users/:id/unsuspend", unsuspendUser);

// Post management
adminRouter.get("/posts", getAllPosts);
adminRouter.delete("/posts/:id", removePost);

// Report management
adminRouter.get("/reports", getReports);
adminRouter.patch("/reports/:id/resolve", resolveReport);
adminRouter.patch("/reports/:id/reject", rejectReport);

// Statistics
adminRouter.get("/stats", getStats);

export default adminRouter;