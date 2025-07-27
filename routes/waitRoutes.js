const express = require("express");
const router = express.Router();
const { registerWait, getWait } = require("../controllers/waitlistController");

router.post("/register", registerWait);
router.get("/:user_id", getWait);

module.exports = router;