import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "7mb" }))
app.use(express.urlencoded({ extended: true, limit: "2mb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js";
import attendanceRouter from "./routes/attendance.route.js";

// Register routes
app.use("/api/user", userRouter);
app.use("/api/attendance", attendanceRouter);

export default app