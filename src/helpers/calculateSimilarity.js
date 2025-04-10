export function calculateFaceSimilarity(face1, face2) {
    const landmarkKeys = [
        'leftEyePosition',
        'rightEyePosition',
        'nosePosition',
        'mouthLeftPosition',
        'mouthRightPosition'
    ];

    let similarityScore = 0;
    const totalLandmarks = landmarkKeys.length;

    landmarkKeys.forEach(key => {
        if (face1[key] && face2[key]) {
            const distance = calculateDistance(face1[key], face2[key]);
            // Normalize and invert distance (closer = more similar)
            similarityScore += 1 / (1 + distance);
        }
    });

    return similarityScore / totalLandmarks;
}

/**
 * Calculate Euclidean distance between two points
 */
function calculateDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) +
        Math.pow(point1.y - point2.y, 2)
    );
}

