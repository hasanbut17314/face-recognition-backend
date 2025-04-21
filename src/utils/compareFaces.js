import * as faceapi from 'face-api.js';
import canvas from 'canvas';

const compareFaces = async (cloudinaryUrl, uploadedImageBuffer) => {
    try {
        // Load the stored image from URL as before
        const storedImage = await canvas.loadImage(cloudinaryUrl);

        // Load the uploaded image from buffer instead of path
        const uploadedImage = await canvas.loadImage(uploadedImageBuffer);

        const storedFaceDetection = await faceapi.detectSingleFace(storedImage)
            .withFaceLandmarks()
            .withFaceDescriptor();

        const uploadedFaceDetection = await faceapi.detectSingleFace(uploadedImage)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!storedFaceDetection || !uploadedFaceDetection) {
            return {
                matched: false,
                message: 'Could not detect face in one or both images'
            };
        }

        const storedDescriptor = storedFaceDetection.descriptor;
        const uploadedDescriptor = uploadedFaceDetection.descriptor;

        const distance = faceapi.euclideanDistance(storedDescriptor, uploadedDescriptor);

        const MATCH_THRESHOLD = 0.6;
        const matched = distance <= MATCH_THRESHOLD;

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

export default compareFaces;