import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "trashit/uploads"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(file.buffer);
    });
};

export const uploadImage = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No images uploaded"
            });
        }

        const uploadResults = await Promise.all(
            req.files.map((file) => uploadToCloudinary(file))
        );

        const images = uploadResults.map((result) => ({
            url: result.secure_url,
            publicId: result.public_id
        }));

        return res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            images
        });

    } catch (error) {
        console.error("Cloudinary upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Error uploading images",
            error: error.message
        });
    }
};