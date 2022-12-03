const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// create a new chat
router.post("/create-new-chat", authMiddleware, async (req, res) => {
  try {
    const newChat = new Chat(req.body);
    await (await newChat.save()).populate("members");
    res.send({
      success: true,
      data: newChat,
    });
  } catch (error) {
    res.send({
      error: error.message,
      success: false,
    });
  }
});

// get all chats of a user
router.get("/get-all-chats", authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({
      members: {
        $in: [req.body.userId],
      },
    })
      .sort({
        updatedAt: -1,
      })
      .populate("lastMessage")
      .populate("members");
    res.send({
      success: true,
      data: chats,
    });
  } catch (error) {
    res.send({
      error: error.message,
      success: false,
    });
  }
});

// clear unread messages
router.post("/clear-unread", authMiddleware, async (req, res) => {
  try {
    await Chat.findByIdAndUpdate(req.body.chat, {
      unread: 0,
    });

    await Message.updateMany(
      {
        chat: req.body.chat,
        read: false,
      },
      {
        read: true,
      }
    );
    res.send({
      success: true,
    });
  } catch (error) {
    res.send({
      error: error.message,
      success: false,
    });
  }
});

module.exports = router;
