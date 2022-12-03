import { message } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreateChat } from "../../apicalls/messages";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";

function UsersList({ allUsers, setAllChats, allChats }) {
  const [inputIconType = "search", setInputIconType] = useState("search");
  const [searchText, setSearchText] = useState("");
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
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

  const createChat = async (selectedUser) => {
    try {
      dispatch(ShowLoading());
      const response = await CreateChat({
        members: [user._id, selectedUser._id],
      });
      dispatch(HideLoading());
      if (response.success) {
        setAllChats((allChatsOld) => {
          return [response.data, ...allChatsOld];
        });
        setSearchText("");
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getFilteredUsers = () => {
    return allUsers?.filter((userObj) => {
      return (
        userObj.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !allChats.find((chat) =>
          chat.members.find((member) => member._id === userObj._id)
        )
      );
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="search-icon-parent">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="    Search user"
          onFocus={() => setInputIconType("back")}
          onBlur={() => setInputIconType("search")}
        />
        <div className="search-icon">
          {inputIconType === "search" && <i class="ri-search-line"></i>}
          {inputIconType === "back" && (
            <i class="ri-arrow-left-line" onClick={() => setSearchText("")}></i>
          )}
        </div>
      </div>
      {searchText.length > 0 && getFilteredUsers().length > 0 && (
        <div className="chat-users-list">
          {getFilteredUsers()?.map((userObj, index) => (
            <div
              className={`flex gap-2 user-chat-item`}
              key={userObj._id}
              onClick={() => createChat(userObj)}
            >
              {!userObj.image && (
                <div
                  className="user-chat-icon"
                  style={{
                    backgroundColor: randomColors[index],
                  }}
                >
                  <h1>{userObj.name[0].toUpperCase()}</h1>
                </div>
              )}
              {userObj.image && (
                <img
                  src={userObj.image}
                  alt="user"
                  className="user-chat-icon"
                ></img>
              )}
              <div className="w-100 flex justify-between items-center">
                <h1 className="user-chat-name uppercase">{userObj?.name}</h1>
                <h1 className="btn btn-primary text-sm">Add to chat</h1>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersList;
