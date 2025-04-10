import mongoose, { Schema } from "mongoose";

const faceProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
})

export const FaceProfile = mongoose.model("FaceProfile", faceProfileSchema)