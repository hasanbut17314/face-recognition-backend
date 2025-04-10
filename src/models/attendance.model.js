import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["present", "absent"],
        required: true,
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    }
}, {
    timestamps: true
})

export const Attendance = mongoose.model("Attendance", attendanceSchema)