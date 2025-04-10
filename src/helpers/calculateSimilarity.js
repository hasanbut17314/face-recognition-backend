/**
 * Calculate similarity between two faces detected by Google Vision API
 * This function uses multiple facial landmarks and features to determine similarity
 * @param {Object} face1 - Face annotation from Google Vision API for the first face
 * @param {Object} face2 - Face annotation from Google Vision API for the second face
 * @returns {Number} - Similarity score between 0 and 1 (higher is more similar)
 */
export function calculateFaceSimilarity(face1, face2) {
    // Define all available facial landmarks to use for comparison
    const landmarkKeys = [
        'leftEyePosition',
        'rightEyePosition',
        'nosePosition',
        'mouthLeftPosition',
        'mouthRightPosition',
        'leftEyebrowUpperMidPosition',
        'rightEyebrowUpperMidPosition',
        'leftEarPosition',
        'rightEarPosition',
        'chinPosition'
    ];

    // Define facial features to compare
    const featureKeys = [
        'joyLikelihood',
        'sorrowLikelihood',
        'angerLikelihood',
        'surpriseLikelihood',
        'detectionConfidence',
        'landmarkingConfidence'
    ];

    let similarityScore = 0;
    let totalWeight = 0;

    // Compare facial landmarks (weight: 0.7)
    const landmarkWeight = 0.7;
    let landmarkScore = 0;
    let validLandmarks = 0;

    landmarkKeys.forEach(key => {
        if (face1[key] && face2[key]) {
            const distance = calculateDistance(face1[key], face2[key]);
            // Normalize and invert distance (closer = more similar)
            // Use a sigmoid-like function to make the score more sensitive to small differences
            landmarkScore += 1 / (1 + Math.exp(distance - 10));
            validLandmarks++;
        }
    });

    // Only add landmark score if we have valid landmarks
    if (validLandmarks > 0) {
        similarityScore += (landmarkScore / validLandmarks) * landmarkWeight;
        totalWeight += landmarkWeight;
    }

    // Compare facial features (weight: 0.3)
    const featureWeight = 0.3;
    let featureScore = 0;
    let validFeatures = 0;

    featureKeys.forEach(key => {
        if (face1[key] !== undefined && face2[key] !== undefined) {
            // For likelihood values (joy, sorrow, etc.), compare the enum values
            if (key.includes('Likelihood')) {
                const likelihoodValues = ['UNKNOWN', 'VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];
                const index1 = likelihoodValues.indexOf(face1[key]);
                const index2 = likelihoodValues.indexOf(face2[key]);

                if (index1 !== -1 && index2 !== -1) {
                    // Calculate similarity based on how close the likelihood values are
                    const maxDiff = likelihoodValues.length - 1;
                    const diff = Math.abs(index1 - index2);
                    featureScore += 1 - (diff / maxDiff);
                    validFeatures++;
                }
            }
            // For confidence values, compare directly
            else if (key.includes('Confidence')) {
                const diff = Math.abs(face1[key] - face2[key]);
                featureScore += 1 - diff;
                validFeatures++;
            }
        }
    });

    // Only add feature score if we have valid features
    if (validFeatures > 0) {
        similarityScore += (featureScore / validFeatures) * featureWeight;
        totalWeight += featureWeight;
    }

    // If we have no valid comparisons, return 0
    if (totalWeight === 0) {
        return 0;
    }

    // Normalize the final score
    return similarityScore / totalWeight;
}

/**
 * Calculate Euclidean distance between two points
 * @param {Object} point1 - Point with x and y coordinates
 * @param {Object} point2 - Point with x and y coordinates
 * @returns {Number} - Euclidean distance between the points
 */
function calculateDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) +
        Math.pow(point1.y - point2.y, 2)
    );
}

