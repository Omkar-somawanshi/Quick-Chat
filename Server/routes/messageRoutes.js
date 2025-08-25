// routes/messageRoutes.js
import express from "express";
import { protectRoute } from "../middleware/auth.js";   // <-- correct path
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  markMessageAsSeen,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/:id", protectRoute, sendMessage);
router.put("/seen/:id", protectRoute, markMessageAsSeen);

export default router;
