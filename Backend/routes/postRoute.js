import express from "express";

import {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    updatePostStatus,
    deletePost,
    getMyPosts
} from "../controller/postController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const postRouter = express.Router();

postRouter.post("/", authMiddleware, createPost);
postRouter.get("/", getPosts);
postRouter.get("/my", authMiddleware, getMyPosts);
postRouter.get("/:id", getPostById);
postRouter.put("/:id", authMiddleware, updatePost);
postRouter.patch("/:id/status", authMiddleware, updatePostStatus);
postRouter.delete("/:id", authMiddleware, deletePost);

export default postRouter;
