import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import { ClearUnreadMessages } from "../../apicalls/messages";

function ChatList({
  onlineUserIds,
  allChats,
  setSelectedChat,
  selectedChat,
  setAllChats,
}) {
  const { user } = useSelector((state) => state.users);
  const randomColors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
  ];

  const getLastTime = (chat) => {
    const time = chat.lastMessage?.createdAt;
    // if day is today return time
    if (moment(time).isSame(moment(), "day")) {
      return moment(time).format("hh:mm A");
    }
    return moment(time).format("DD-MM-YYYY");
  };

  const clearUnread = async (chat, index) => {
    // set unread to 0
    if (
      chat.unread &&
      chat.unread > 0 &&
      chat.lastMessage?.sender !== user._id
    ) {
      setAllChats((prevChats) => {
        const newChats = [...prevChats];
        newChats[index].unread = 0;
        return newChats;
      });
      await ClearUnreadMessages(chat._id);
    }
  };

  return (
    <div className="chat-users-list">
      {allChats?.map((chat, index) => {
        const receipentUser = chat.members.find(
          (member) => member._id !== user._id
        );
        return (
          <div
            className={`flex gap-2 user-chat-item ${
              selectedChat?._id === chat._id ? "selected-user-chat-item" : ""
            }`}
            key={chat._id}
            onClick={() => {
              clearUnread(chat, index);
              setSelectedChat(chat);
            }}
          >
            {!receipentUser.image && (
              <div
                className="user-chat-icon"
                style={{
                  backgroundColor: randomColors[index],
                }}
              >
                <h1>{receipentUser.name[0].toUpperCase()}</h1>
              </div>
            )}
            {receipentUser.image && (
              <img
                src={receipentUser.image}
                alt="user"
                className="user-chat-icon"
              />
            )}
            <div className="w-100">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <h1 className="user-chat-name">{receipentUser?.name}</h1>
                  {onlineUserIds.includes(receipentUser._id) && (
                    <div className="user-active-status"></div>
                  )}
                </div>
                {chat?.unread > 0 && chat.lastMessage.sender !== user._id && (
                  <p className="user-chat-unseen-count">{chat?.unread}</p>
                )}
              </div>
              {chat?.lastMessage && (
                <div className="flex justify-between w-100">
                  <p className="user-chat-last-message">
                    <b>
                      {chat?.lastMessage?.sender === user._id ? "You: " : ""}
                    </b>
                    {chat?.lastMessage?.text}
                  </p>

                  <p className="user-chat-last-message-time">
                    {getLastTime(chat)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;
