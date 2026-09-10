import express from "express";

import {
    updateProfile,
    changePassword,
    deleteAccount
} from "../controller/profileController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const profileRouter = express.Router();

profileRouter.put("/", authMiddleware, updateProfile);
profileRouter.put("/password", authMiddleware, changePassword);
profileRouter.delete("/", authMiddleware, deleteAccount);

export default profileRouter;