const Chat = require("./models/Chat");

exports.setupSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", (user_id) => {
      socket.join(user_id);
    });

    socket.on("send_message", async ({ chat_id, sender, text }) => {
      const chat = await Chat.findById(chat_id);
      if (chat) {
        const msg = { sender, text, timestamp: new Date() };
        chat.messages.push(msg);
        await chat.save();

        chat.users.forEach((u) => {
          io.to(u).emit("new_message", { chat_id, message: msg });
        });
      }
    });
  });
};