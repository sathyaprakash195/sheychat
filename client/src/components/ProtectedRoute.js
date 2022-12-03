import { message } from "antd";
import React, { useEffect } from "react";
import { GetUserInfo } from "../apicalls/users";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../redux/usersSlice.js";
import { useNavigate } from "react-router-dom";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import Profile from "./Profile";

function ProtectedRoute({ children }) {
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getUserData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetUserInfo();
      dispatch(HideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        navigate("/login");
        message.error(response.message);
      }
    } catch (error) {
      navigate("/login");
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      if (!user) {
        getUserData();
      }
    } else {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    user && (
      <div className="layout">
        <div className="flex gap-2 w-full h-full h-100">
          <div className="w-100">
            <div className="header flex justify-between">
              <h1 className="text-2xl text-white">SHEY CHAT</h1>
              <div>
                <div className="flex gap-1 items-center">
                  <h1
                    className="text-md text-white underline cursor-pointer"
                    onClick={() => setShowProfileModal(true)}
                  >
                    {user?.name}
                  </h1>
                  <i
                    className="ri-logout-circle-r-line"
                    onClick={() => {
                      localStorage.removeItem("token");
                      navigate("/login");
                    }}
                  ></i>
                </div>
              </div>
            </div>
            <div className="content">{children}</div>
          </div>
        </div>

        {showProfileModal && (
          <Profile
            showProfileModal={showProfileModal}
            setShowProfileModal={setShowProfileModal}
          />
        )}
      </div>
    )
  );
}

export default ProtectedRoute;
