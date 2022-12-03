import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  ClearUnreadMessages,
  GetMessages,
  SendMessage,
} from "../../apicalls/messages";
import { message } from "antd";
import moment from "moment";

function ChatArea({
  selectedUserChat,
  setSelectedChat,
  socket,
  isOnline,
  receipentUser,
}) {
  const [typing, setTyping] = React.useState(false);
  const [messages = [], setMessages] = React.useState([]);
  const [messageText, setMessageText] = React.useState("");
  const { user } = useSelector((state) => state.users);

  const onSend = async () => {
    try {
      const data = {
        sender: user._id,
        chat: selectedUserChat._id,
        text: messageText,
        members: selectedUserChat.members.map((member) => member._id),
      };
      socket.emit("send-message", data);

      setMessageText("");
      await SendMessage(data);
    } catch (error) {
      message.error("Error sending message");
    }
  };

  const getMessages = async () => {
    try {
      const response = await GetMessages({
        chat: selectedUserChat._id,
      });
      setMessages(response.data);
    } catch (error) {
      message.error("Error fetching messages");
    }
  };

  useEffect(() => {
    getMessages();

    socket.on("newMessage", (data) => {
      setSelectedChat((prevChat) => {
        if (data.chat === prevChat._id) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
        return prevChat;
      });
      if (user._id !== data.sender) {
        socket.emit("clear-unread", {
          _id: selectedUserChat._id,
          members: selectedUserChat.members.map((member) => member._id),
        });
        ClearUnreadMessages(data.chat);
      }
    });

    socket.on("typing", (data) => {
      setSelectedChat((prevChat) => {
        if (data.chat === prevChat._id && data.sender !== user._id) {
          setTyping(data.typing);
        }
        setTimeout(() => {
          setTyping(false);
        }, 1000);
        return prevChat;
      });
    });

    socket.emit("clear-unread", {
      _id: selectedUserChat._id,
      members: selectedUserChat.members.map((member) => member._id),
    });

    socket.on("unread-cleared", (data) => {
      if (data._id === selectedUserChat._id) {
        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            if (message.sender === user._id) {
              return {
                ...message,
                read: true,
              };
            }
            return message;
          });
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserChat]);

  useEffect(() => {
    const chatArea = document.getElementById("messages");
    chatArea.scrollTop = chatArea.scrollHeight;
  }, [messages]);

  return (
    <div className="chat-area-parent">
      <div className="selected-user-chat">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h1 className="user-chat-name">
              {receipentUser?.name.toUpperCase()}
            </h1>
            <b className="user-chat-status text-primary">
              {typing ? "Typing..." : isOnline ? "Online" : ""}
            </b>
          </div>
        </div>
      </div>
      <div className="messages" id="messages">
        {messages.map((message) => (
          <div
            className={`message ${
              message.sender === user._id ? "message-sent" : "message-received"
            }`}
            key={message._id}
          >
            <div className="flex flex-col">
              <span className="text flex items-center gap-1">
                {message.text}
                {message.sender === user._id && (
                  <i
                    class="ri-check-double-line"
                    style={{
                      color: message.read ? "green" : "white",
                    }}
                  ></i>
                )}
              </span>
              <span className="time">
                {moment(message.createdAt).format("hh:mm A")}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="new-message">
        <input
          type="text"
          placeholder="Type a message"
          value={messageText}
          onChange={(e) => {
            socket.emit("typing", {
              chat: selectedUserChat._id,
              members: selectedUserChat.members.map((member) => member._id),
              typing: true,
              sender: user._id,
            });
            setMessageText(e.target.value);
          }}
          className="message-input"
        />
        <button
          className="send-message-btn flex items-center justify-center"
          disabled={!messageText}
          onClick={()=> messageText && onSend()}
        >
          <i class="ri-send-plane-2-line"></i>
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
