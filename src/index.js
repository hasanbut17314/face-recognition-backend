import dotenv from "dotenv";
import app from "./app.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import connectDB from './db/index.js'
import { User } from "./models/user.model.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log("DB connection failed! ", error);
    })

// const update = async () => {
//     try {
//         const users = await User.findByIdAndUpdate("682cc6be43d66756ee0c00ff", { role: "user" }, { new: true });
//         console.log(users);
//     } catch (error) {
//         console.error("Error fetching users:", error);
//     }
// }

// update();

// const getAllUsers = async () => {
//     try {
//         const users = await User.find({});
//         console.log(users);
//     } catch (error) {
//         console.error("Error fetching users:", error);
//     }
// }

// getAllUsers();

app.get("/", (_, res) => {
    res.send("Hello World!");
})

app.use(errorHandler)