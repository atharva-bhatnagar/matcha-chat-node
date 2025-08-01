const express = require("express");
const router = express.Router();
const { registerWait, getWait, sendMail } = require("../controllers/waitlistController");

router.post("/register", registerWait);
router.get("/:user_id", getWait);
router.post("/send",sendMail)

module.exports = router;