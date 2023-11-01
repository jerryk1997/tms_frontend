import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Axios from "axios";

// Custom modules
import { ACTION, ADMIN_API } from "../../config/constants";

// Context
import DispatchContext from "../../DispatchContext";
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";
import PasswordChangeInput from "../PasswordChangeInput";

function User({ user, index }) {
  // ======================= Context =======================
  const appDispatch = useContext(DispatchContext);
  const userMgmtState = useContext(UserManagementStateContext);
  const userMgmtDispatch = useContext(UserManagementDispatchContext);

  // ======================= Page state =======================
  const [isEditing, setIsEditing] = useState(false);
  const [groupOptions, setGroupOptions] = useState();

  const [email, setEmail] = useState(user.email);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [selectedGroupOptions, setSelectedGroups] = useState();
  const [selectedStatusOption, setSelectedStatus] = useState();

  const [canSubmit, setCanSubmit] = useState(false);

  const userStatusOptions = [
    { label: "Active", value: "active" },
    { label: "Disabled", value: "disabled" }
  ];

  // ======================= Event Listeners =======================
  const handleEdit = userId => {
    setIsEditing(true);
  };

  const handleConfirm = userId => {
    setIsEditing(false);
  };

  const handleCancel = userId => {
    setIsEditing(false);
  };

  function handleGroupChange(selectedGroups) {
    setSelectedGroups(selectedGroups);
  }

  function handleStatusChange(selectedStatus) {
    setSelectedStatus(selectedStatus);
  }

  async function handleCreateOption(option) {
    try {
      await Axios.post(
        ADMIN_API.createGroup,
        { groupName: option },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      setSelectedGroups(prev =>
        prev.concat({
          label: option,
          value: option
        })
      );
      userMgmtDispatch({ type: ACTION.createGroup, value: option });
      appDispatch({
        type: ACTION.flashMessage,
        value: "Successfully created group"
      });
    } catch (error) {
      console.log(error);
      appDispatch({
        type: ACTION.flashMessage,
        value: "Failed to create group"
      });
    }
  }

  // ======================= UseEffects =======================
  useEffect(() => {
    setEmail(user.email || "");
    if (user.groups) {
      setSelectedGroups(
        user.groups.map(group => {
          return {
            label: group,
            value: group
          };
        })
      );
    }
    setSelectedStatus(
      user.is_active ? userStatusOptions[0] : userStatusOptions[1]
    );
  }, []);

  // Checks if they user can submit changes
  let enableSubmitDebounce;
  useEffect(() => {
    enableSubmitDebounce = setTimeout(() => {
      const validNonEmptyPassword = password !== "" && passwordError === "";
      const emailChanged = email !== user.email;

      let selectedGroups;
      if (selectedGroupOptions) {
        selectedGroups = selectedGroupOptions.map(group => group.value);
      }

      const groupsUnchanged =
        (!selectedGroups && !user.groups) ||
        (selectedGroups &&
          user.groups &&
          selectedGroups.every(group => user.groups.includes(group)) &&
          user.groups.every(group => selectedGroups.includes(group)));

      const statusChanged =
        selectedStatusOption.value !== (user.is_active ? "active" : "disabled");

      setCanSubmit(
        validNonEmptyPassword ||
          (passwordError === "" &&
            (emailChanged || !groupsUnchanged || statusChanged))
      );
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [
    user,
    email,
    password,
    passwordError,
    selectedGroupOptions,
    selectedStatusOption
  ]);

  useEffect(() => {
    setGroupOptions(
      userMgmtState.groups.map(group => {
        return {
          label: group,
          value: group
        };
      })
    );
  }, [userMgmtState]);

  // ======================= JSX =======================
  return (
    <tr key={index}>
      <td>{user.username}</td>

      <td>
        <input
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={!isEditing}
        />
      </td>

      {/* ========== Password Edit =========== */}
      <td style={{ maxWidth: "250px" }}>
        <PasswordChangeInput
          password={password}
          setPassword={setPassword}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          setCanSubmit={setCanSubmit}
          disabled={!isEditing}
          className="form-control"
        />
      </td>

      {/* ========== Group select =========== */}
      <td style={{ maxWidth: "300px" }}>
        <CreatableSelect
          isMulti
          options={groupOptions}
          value={selectedGroupOptions}
          onChange={handleGroupChange}
          onCreateOption={handleCreateOption}
          isDisabled={!isEditing}
        />
      </td>

      {/* ========== Active / Disable =========== */}
      <td>
        <Select
          options={userStatusOptions}
          value={selectedStatusOption}
          onChange={handleStatusChange}
          isDisabled={!isEditing}
        ></Select>
      </td>

      {/* ========== Buttons =========== */}
      <td style={{ maxWidth: "100px" }}>
        <div style={{ width: "flex", gap: "30px" }}>
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleConfirm}
                style={{ marginBottom: "5px" }}
                ref={button => button && button.blur()}
                disabled={!canSubmit}
              >
                Confirm
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleCancel}
                ref={button => button && button.blur()}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleEdit}
              ref={button => button && button.blur()}
            >
              Edit
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default User;
