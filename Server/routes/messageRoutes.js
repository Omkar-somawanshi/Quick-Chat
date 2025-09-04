import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  markMessageAsSeen,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);  // <--- fixed here
router.put("/seen/:id", protectRoute, markMessageAsSeen);

export default router;
