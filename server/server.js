const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const dbConfig = require("./config/dbConfig");
const usersRoute = require("./routes/usersRoute");
const chatsRoute = require("./routes/chatsRoute");
const messagesRoute = require("./routes/messagesRoute");
app.use("/api/users", usersRoute);
app.use("/api/chats", chatsRoute);
app.use("/api/messages", messagesRoute);
const port = process.env.PORT || 5000;
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
let onlineUsers = [];
io.on("connection", (socket) => {
  socket.on("came-online", (userId) => {
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }
    io.emit("online-users-updated", onlineUsers);
  });

  socket.on("went-offline", (userId) => {
    console.log("went-offline", userId);
    onlineUsers = onlineUsers.filter((id) => id !== userId);
    io.emit("onlineUsers", onlineUsers);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });
  socket.on("typing", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("typing", data);
  });
  socket.on("send-message", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("newMessage", data);
  });

  socket.on("clear-unread", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("unread-cleared", data);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
