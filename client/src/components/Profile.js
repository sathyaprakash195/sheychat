import { message, Modal } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UpdateProfilePicture } from "../apicalls/users";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";

function Profile({ showProfileModal, setShowProfileModal }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const [image, setimage] = useState(user.image || "");
  function handleFileInput(e) {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setimage(reader.result);
    };
  }

  const updateProfilePicture = async () => {
    try {
      dispatch(ShowLoading());
      const response = await UpdateProfilePicture({ image });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setShowProfileModal(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <Modal
      title="Profile"
      open={showProfileModal}
      closable={false}
      footer={null}
      width={600}
    >
      <div className="flex gap-2 items-center">
        <div className="text-md flex-col flex uppercase w-100">
          <span>{user?.name} </span>
          <span>{user?.email}</span>
          <span>
               Added On : {new Date(user?.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-col items-end">
          {image !== "" && <img src={image} height="100" width="100" alt="" />}
          <input
            id="filePicker"
            style={{ visibility: "hidden" }}
            type="file"
            onChange={handleFileInput}
          ></input>
          <label
            htmlFor="filePicker"
            style={{
              border: "1px solid black",
              padding: "5px 10px",
              width: "fit-content",
            }}
          >
            Update Profile Picture
          </label>
        </div>
      </div>
      <div className="flex justify-end w-100 gap-2 mt-2">
        <button
          className="primary-outlined-btn"
          onClick={() => setShowProfileModal(false)}
        >
          Close
        </button>
        <button
          className="primary-contained-btn"
          onClick={updateProfilePicture}
        >
          Update Profile
        </button>
      </div>
    </Modal>
  );
}

export default Profile;
