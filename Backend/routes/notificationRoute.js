import express from "express";

import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification
} from "../controller/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authMiddleware, getNotifications);
notificationRouter.get("/unread-count", authMiddleware, getUnreadCount);
notificationRouter.patch("/:id/read", authMiddleware, markAsRead);
notificationRouter.patch("/read-all", authMiddleware, markAllAsRead);
notificationRouter.delete("/:id", authMiddleware, deleteNotification);

export default notificationRouter;
