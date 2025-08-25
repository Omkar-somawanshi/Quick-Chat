// routes/userRoutes.js
import express from "express";
import { checkAuth, login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";


const userRouter = express.Router();


userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
// Corrected the method to GET to match your frontend request
userRouter.get("/check", protectRoute, checkAuth); 


export default userRouter;
