const express = require("express");
const router = express.Router();
const { startChat, getChats, sendMessage, markMessagesAsRead } = require("../controllers/chatController");

router.post("/start", startChat);
router.get("/:user_id", getChats);
router.post("/send", sendMessage);
router.post("/read", markMessagesAsRead);


module.exports = router;
