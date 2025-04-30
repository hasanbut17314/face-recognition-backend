import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "D:\\tmp");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
    }
});

// Configure multer with custom settings
export const upload = multer({ storage });