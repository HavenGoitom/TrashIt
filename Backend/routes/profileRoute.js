import express from "express";

import {
    updateProfile,
    changePassword
} from "../controller/profileController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const profileRouter = express.Router();

// No account deletion — the only removal path is admin suspension.
profileRouter.put("/", authMiddleware, updateProfile);
profileRouter.put("/password", authMiddleware, changePassword);

export default profileRouter;