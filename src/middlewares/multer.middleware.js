import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
    }
});

// Custom file filter to handle React Native file objects
const fileFilter = (req, file, cb) => {
    // Accept the file
    cb(null, true);
};

// Configure multer with custom settings
export const upload = multer({
    storage,
    fileFilter,
});