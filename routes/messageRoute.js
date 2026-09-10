import express from "express";

import {
    createOrGetConversation,
    getConversations,
    getMessages
} from "../controller/messageController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const messageRouter = express.Router();

messageRouter.post("/conversations", authMiddleware, createOrGetConversation);
messageRouter.get("/conversations", authMiddleware, getConversations);
messageRouter.get("/conversations/:id/messages", authMiddleware, getMessages);

export default messageRouter;