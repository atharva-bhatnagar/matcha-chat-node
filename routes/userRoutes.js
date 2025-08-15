const express = require("express");
const router = express.Router();
const { registerUser, verifyUser, getUser, sendOTP } = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/verify/:code", verifyUser);
router.get("/:user_id", getUser);
router.post("/send",sendOTP)

module.exports = router;