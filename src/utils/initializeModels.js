// loadFaceApiModels.js
import * as faceapi from 'face-api.js';
import path from 'path';
import { fileURLToPath } from 'url';
import canvas from 'canvas';
import * as tf from '@tensorflow/tfjs-node'; // Add TensorFlow.js Node

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global variable to track if models are loaded
let modelsLoaded = false;

const loadFaceApiModels = async () => {
    // Return immediately if models are already loaded
    if (modelsLoaded) return true;

    try {
        // Optimize TensorFlow settings
        tf.env().set('WEBGL_CPU_FORWARD', false);
        tf.env().set('WEBGL_PACK', true);

        const modelPath = path.join(__dirname, '..', '..', 'models');
        console.log('Loading face-api.js models from:', modelPath);

        await Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
            faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
            faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
        ]);

        console.log('All face-api.js models loaded successfully');
        modelsLoaded = true;
        return true;
    } catch (error) {
        console.error('Error loading face-api.js models:', error);
        throw error;
    }
};

export default loadFaceApiModels;