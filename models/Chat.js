const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  users: [String], // user_id of both participants
  messages: [
    {
      sender: String,
      text: String,
      timestamp: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
