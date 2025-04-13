import mongoose, { Schema } from "mongoose";

const boundSchema = new Schema({
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true }
});

const faceDataSchema = new Schema({
    bounds: { type: boundSchema, required: true },
    pitchAngle: { type: Number, required: true },
    rollAngle: { type: Number, required: true },
    yawAngle: { type: Number, required: true }
});

const faceProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    faceData: {
        type: [faceDataSchema],
        default: []
    }
}, {
    timestamps: true
});

export const FaceProfile = mongoose.model("FaceProfile", faceProfileSchema);