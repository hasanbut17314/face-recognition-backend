import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Download an image from a URL and save it to a temporary file
 * @param {string} imageUrl - URL of the image to download
 * @param {string} prefix - Prefix for the temporary file name
 * @returns {Promise<string>} - Path to the downloaded image file
 */
export const downloadImageFromUrl = async (imageUrl, prefix = 'image') => {
    return new Promise((resolve, reject) => {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate a unique filename
        const filename = `${prefix}_${Date.now()}.jpg`;
        const filePath = path.join(tempDir, filename);

        // Create a write stream
        const fileStream = fs.createWriteStream(filePath);

        // Download the image
        https.get(imageUrl, (response) => {
            // Check if the response is an image
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.includes('image')) {
                fileStream.close();
                fs.unlinkSync(filePath);
                return reject(new Error(`Invalid content type: ${contentType}`));
            }

            // Pipe the response to the file
            response.pipe(fileStream);

            // Handle errors
            fileStream.on('error', (err) => {
                fileStream.close();
                fs.unlinkSync(filePath);
                reject(err);
            });

            // When the download is complete
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filePath);
            });
        }).on('error', (err) => {
            fileStream.close();
            fs.unlinkSync(filePath);
            reject(err);
        });
    });
};

/**
 * Clean up temporary files
 * @param {string} filePath - Path to the file to delete
 */
export const cleanupTempFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up temporary file: ${filePath}`);
        } catch (error) {
            console.error(`Error cleaning up temporary file: ${filePath}`, error);
        }
    }
};

/**
 * Extract public ID from a Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not found
 */
export const extractCloudinaryPublicId = (url) => {
    try {
        if (!url) return null;

        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        const uploadIndex = pathParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return null;

        let startIndex = uploadIndex + 1;
        if (pathParts[startIndex] && pathParts[startIndex].startsWith('v')) {
            startIndex++;
        }

        const publicIdParts = pathParts.slice(startIndex);
        let publicId = publicIdParts.join('/');

        if (publicId.includes('.')) {
            publicId = publicId.substring(0, publicId.lastIndexOf('.'));
        }

        return publicId;
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
}; 