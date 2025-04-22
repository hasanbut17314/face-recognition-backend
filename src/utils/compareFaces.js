import * as faceapi from 'face-api.js';
import canvas from 'canvas';

// Cache for face descriptors to avoid reprocessing
const descriptorCache = new Map();

// Image optimization function
const prepareImage = async (imageUrl) => {
    const img = await canvas.loadImage(imageUrl);

    const maxDimension = 640;
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));

    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const smallCanvas = canvas.createCanvas(width, height);
    const ctx = smallCanvas.getContext('2d');

    ctx.drawImage(img, 0, 0, width, height);

    return smallCanvas;
};

const getFaceDescriptor = async (imageUrl, cacheKey) => {
    if (cacheKey && descriptorCache.has(cacheKey)) {
        console.log("Using cached descriptor for", cacheKey);
        return descriptorCache.get(cacheKey);
    }

    const optimizedImage = await prepareImage(imageUrl);

    const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.5,
        maxResults: 1
    });

    const detection = await faceapi.detectSingleFace(optimizedImage, faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) return null;

    if (cacheKey) {
        descriptorCache.set(cacheKey, detection.descriptor);
    }

    return detection.descriptor;
};

const compareFaces = async (cloudinaryUrl, uploadedImagePath, userId = null) => {
    try {
        console.time('faceComparison');

        const [storedDescriptor, uploadedDescriptor] = await Promise.all([
            getFaceDescriptor(cloudinaryUrl, userId),
            getFaceDescriptor(uploadedImagePath)
        ]);

        if (!storedDescriptor || !uploadedDescriptor) {
            console.timeEnd('faceComparison');
            return {
                matched: false,
                message: 'Could not detect face in one or both images'
            };
        }

        // Calculate distance
        const distance = faceapi.euclideanDistance(storedDescriptor, uploadedDescriptor);
        const MATCH_THRESHOLD = 0.6;
        const matched = distance <= MATCH_THRESHOLD;

        console.timeEnd('faceComparison');
        return {
            matched,
            distance,
            threshold: MATCH_THRESHOLD
        };
    } catch (error) {
        console.error('Error comparing faces:', error);
        throw error;
    }
};

setInterval(() => {
    const cacheSize = descriptorCache.size;
    if (cacheSize > 0) {
        console.log(`Clearing face descriptor cache (${cacheSize} entries)`);
        descriptorCache.clear();
    }
}, 1000 * 60 * 60); // Clear every hour

export default compareFaces;