const Chat = require("../models/Chat");

exports.startChat = async (req, res) => {
  const { from, to, message } = req.body;
  try {
    let chat = await Chat.findOne({ users: { $all: [from, to] } });
    if (!chat) {
      chat = new Chat({ users: [from, to], messages: [{ sender: from, text: message }] });
    } else {
      chat.messages.push({ sender: from, text: message });
    }
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
    console.log(err)
  }
};

exports.getChats = async (req, res) => {
  const { user_id } = req.params;
  try {
    const chats = await Chat.find({ users: user_id });
    const result = chats.map((chat) => {
      const otherUser = chat.users.find((u) => u !== user_id);
      const unread = chat.messages.filter((m) => m.sender !== user_id && !m.read).length;
      return {
        chat_id: chat._id,
        with: otherUser,
        messages: chat.messages,
        unread,
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.sendMessage = async (req, res) => {
  const { chat_id, sender, text } = req.body;
  try {
    const chat = await Chat.findById(chat_id);
    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    let updated = false;
    chat.messages.forEach((msg) => {
      if (msg.sender !== sender && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    chat.messages.push({ sender, text });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


exports.markMessagesAsRead = async (req, res) => {
  const { chat_id, reader_id } = req.body;

  try {
    const chat = await Chat.findById(chat_id);
    if (!chat) return res.status(404).json({ msg: "Chat not found" });

    let updated = false;

    chat.messages.forEach((msg) => {
      if (msg.sender !== reader_id && !msg.read) {
        msg.read = true;
        updated = true;
      }
    });

    if (updated) await chat.save();

    res.json({ msg: "Messages marked as read" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};
