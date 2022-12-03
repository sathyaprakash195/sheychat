const { default: axiosInstance } = require(".");

export const RegisterUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/register", payload);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const LoginUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/login", payload);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const GetUserInfo = async () => {
  try {
    const response = await axiosInstance.post("/api/users/get-user-info");
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const GetAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/users/get-all-users");
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};


export const UpdateProfilePicture = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/users/update-profile-picture", payload);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}