import express from "express";

import { uploadImage } from "../controller/uploadController.js";
import upload from "../middleware/multer.js";

const uploadRouter = express.Router();

uploadRouter.post( "/upload", upload.array("images", 10), uploadImage );

export default uploadRouter;