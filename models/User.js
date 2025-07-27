const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  user_id: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: false },
  code: { type: String },
});

module.exports = mongoose.model("User", userSchema);