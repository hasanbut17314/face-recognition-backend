// Function to calculate similarity between facial data points
const calculateFaceSimilarity = (receivedFace, storedFace) => {
    // Calculate differences in angles
    const pitchDiff = Math.abs(receivedFace.pitchAngle - storedFace.pitchAngle);
    const rollDiff = Math.abs(receivedFace.rollAngle - storedFace.rollAngle);
    const yawDiff = Math.abs(receivedFace.yawAngle - storedFace.yawAngle);

    // Calculate differences in face bounds (position and size)
    const boundsDiff = {
        heightDiff: Math.abs(receivedFace.bounds.height - storedFace.bounds.height),
        widthDiff: Math.abs(receivedFace.bounds.width - storedFace.bounds.width),
        xDiff: Math.abs(receivedFace.bounds.x - storedFace.bounds.x),
        yDiff: Math.abs(receivedFace.bounds.y - storedFace.bounds.y)
    };

    // Calculate similarity score (lower is better)
    // You can adjust these thresholds based on your requirements
    const angleTolerance = 15; // degrees
    const sizeTolerance = 50; // pixels
    const positionTolerance = 70; // pixels

    // Check if differences are within tolerance
    const anglesMatch = (
        pitchDiff <= angleTolerance &&
        rollDiff <= angleTolerance &&
        yawDiff <= angleTolerance
    );

    const sizeMatch = (
        boundsDiff.heightDiff <= sizeTolerance &&
        boundsDiff.widthDiff <= sizeTolerance
    );

    const positionMatch = (
        boundsDiff.xDiff <= positionTolerance &&
        boundsDiff.yDiff <= positionTolerance
    );

    // Return overall match result and confidence score
    const matchConfidence = 100 - (
        (pitchDiff + rollDiff + yawDiff) / 3 / angleTolerance * 33 +
        (boundsDiff.heightDiff + boundsDiff.widthDiff) / 2 / sizeTolerance * 33 +
        (boundsDiff.xDiff + boundsDiff.yDiff) / 2 / positionTolerance * 34
    );

    return {
        isMatch: anglesMatch && sizeMatch && positionMatch,
        confidence: Math.max(0, matchConfidence),
        details: {
            anglesMatch,
            sizeMatch,
            positionMatch,
            angleDifferences: { pitchDiff, rollDiff, yawDiff },
            boundsDifferences: boundsDiff
        }
    };
};

// Function to find best match among stored face data
export const findBestFaceMatch = (receivedFace, storedFaces) => {
    if (!storedFaces || storedFaces.length === 0) {
        return { isMatch: false, confidence: 0 };
    }

    let bestMatch = {
        isMatch: false,
        confidence: 0
    };

    for (const storedFace of storedFaces) {
        const similarity = calculateFaceSimilarity(receivedFace, storedFace);

        if (similarity.isMatch && similarity.confidence > bestMatch.confidence) {
            bestMatch = similarity;
        }
    }

    return bestMatch;
};