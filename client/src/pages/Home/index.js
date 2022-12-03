import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllUsers } from "../../apicalls/users";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { Col, message, Row } from "antd";
import ChatList from "./ChatList";
import ChatArea from "./ChatArea";
import { io } from "socket.io-client";
import { GetAllChats } from "../../apicalls/messages";
import UsersList from "./UsersList";
const socket = io("http://localhost:5000");

function Home() {
  const { user } = useSelector((state) => state.users);
  const [allUsers = [], setAllUsers] = useState([]);
  const [allChats = [], setAllChats] = useState([]);
  const [selectedChat = {}, setSelectedChat] = useState(null);
  const [onlineUserIds = [], setOnlineUserIds] = useState([]);
  const dispatch = useDispatch();
  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const usersResponse = await GetAllUsers();
      dispatch(HideLoading());
      if (usersResponse.success) {
        setAllUsers(usersResponse.data);
      } else {
        message.error(usersResponse.message);
      }

      const chatsResponse = await GetAllChats();
      if (chatsResponse.success) {
        setAllChats(chatsResponse.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();

    socket.emit("came-online", user._id);
    socket.emit("join-room", user._id);

    socket.on("online-users-updated", (onlineUsers) => {
      setOnlineUserIds(onlineUsers);
    });

    socket.on("newMessage", (newMessage) => {
      console.log("newMessage", newMessage);
      // new message chat should be on top
      // if the new message is in the selected chat, then update the chat

      setAllChats((prevChats) => {
        const newChats = prevChats.filter(
          (chat) => chat._id !== newMessage.chat
        );
        const newChat = prevChats.find((chat) => chat._id === newMessage.chat);
        newChat.lastMessage = {
          ...newMessage,
          createdAt: new Date().toISOString(),
        };

        setSelectedChat((prevSelectedChat) => {
          if (
            (prevSelectedChat && prevSelectedChat._id !== newMessage.chat) ||
            !prevSelectedChat
          ) {
            if (newChat.unread) {
              newChat.unread += 1;
            } else {
              newChat.unread = 1;
            }
          }
          return prevSelectedChat;
        });

        newChats.unshift(newChat);
        return newChats;
      });
    });

    // if user closes the tab or goes offline then emit went-offline
    window.addEventListener("beforeunload", () => {
      socket.emit("went-offline", user._id);
    });

    return () => {
      socket.emit("went-offline", user._id);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Row gutter={[16, 16]} className="h-100 mt-2">
        <Col span={6}>
          <div className="flex flex-col gap-1">
            <UsersList
              allUsers={allUsers}
              setAllChats={setAllChats}
              allChats={allChats}
            />
            <ChatList
              allChats={allChats}
              onlineUserIds={onlineUserIds}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              socket={socket}
              setAllChats={setAllChats}
            />
          </div>
        </Col>

        <Col span={18}>
          {selectedChat && (
            <ChatArea
              selectedUserChat={selectedChat}
              setSelectedChat={setSelectedChat}
              socket={socket}
              isOnline={
                onlineUserIds.includes(
                  selectedChat.members.find((member) => member._id !== user._id)
                    ._id
                ) || false
              }
              receipentUser={selectedChat.members.find(
                (member) => member._id !== user._id
              )}
            />
          )}
        </Col>
      </Row>
    </>
  );
}

export default Home;
