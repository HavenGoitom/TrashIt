import express from "express";

import {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite
} from "../controller/favoriteController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const favoriteRouter = express.Router();

favoriteRouter.post("/:postId", authMiddleware, addFavorite);
favoriteRouter.delete("/:postId", authMiddleware, removeFavorite);
favoriteRouter.get("/", authMiddleware, getFavorites);
favoriteRouter.get("/check/:postId", authMiddleware, checkFavorite);

export default favoriteRouter;