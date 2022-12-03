import axiosInstance from ".";

export const CreateChat = async (members) => {
  try {
    const response = await axiosInstance.post(
      "/api/chats/create-new-chat",
      members
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetAllChats = async () => {
  try {
    const response = await axiosInstance.get("/api/chats/get-all-chats");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const SendMessage = async (message) => {
  try {
    const response = await axiosInstance.post(
      "/api/messages/send-new-message",
      message
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export const GetMessages = async (chat) => {
  try {
    const response = await axiosInstance.post(
      "/api/messages/get-messages",
      chat
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
};

export const ClearUnreadMessages = async (chat) => {
  try {
    const response = await axiosInstance.post("/api/chats/clear-unread", {chat});
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
}
