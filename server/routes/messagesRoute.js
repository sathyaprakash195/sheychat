const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

// send a new message
router.post("/send-new-message", authMiddleware, async (req, res) => {
  try {
    // create a new message
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.send({
      success: true,
    });

    // update the chat
    await Chat.findByIdAndUpdate(req.body.chat, {
      lastMessage: newMessage._id,
      $inc: {
        unread: 1,
      },
    });
  } catch (error) {
    res.send({
      error: error.message,
      success: false,
    });
  }
});

// get all messages of a user
router.post("/get-messages", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.body.chat,
    }).sort({ createdAt: 1 });
    res.send({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.send({
      error: error.message,
      success: false,
    });
  }
});

module.exports = router;
