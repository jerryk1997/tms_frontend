import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Axios, { AxiosError } from "axios";

// Custom modules
import { ACTION, ADMIN_API, HTTP_CODES } from "../../config/constants";

// Context
import DispatchContext from "../../DispatchContext";
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";
import DispatchCheckContext from "../ProtectedRoute/DispatchCheckContext";
import PasswordChangeInput from "../PasswordChangeInput";

function EditUser({ user, index }) {
  // ======================= Context =======================
  const appDispatch = useContext(DispatchContext);
  const userMgmtState = useContext(UserManagementStateContext);
  const userMgmtDispatch = useContext(UserManagementDispatchContext);
  const checkDispatch = useContext(DispatchCheckContext);

  // ======================= Row state =======================
  const [isEditing, setIsEditing] = useState(false);
  const [groupOptions, setGroupOptions] = useState();

  const [email, setEmail] = useState(user.email || "");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [selectedGroupOptions, setSelectedGroups] = useState([]);
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

  async function handleConfirm() {
    const editedFields = {};
    // ============= Construct request body =============
    if (email !== user.email) {
      editedFields.email = email;
    }

    if (password !== "") {
      editedFields.password = password;
    }

    if (selectedGroupOptions) {
      console.log(user.groups);
      const groups = selectedGroupOptions.map(option => option.value);
      if (
        !user.groups ||
        !(
          groups.every(group => user.groups.includes(group)) &&
          user.groups.every(group => groups.includes(group))
        )
      ) {
        editedFields.groups = groups;
      }
    }

    if (
      selectedStatusOption.value !== (user.is_active ? "active" : "disabled")
    ) {
      editedFields.isActive = selectedStatusOption.value;
    }
    console.log(editedFields);

    // ============= Send request =============
    try {
      await Axios.put(ADMIN_API.user(user.username), editedFields, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      setPassword("");

      // Update page state
      userMgmtDispatch({
        type: ACTION.editUser,
        value: {
          username: user.username,
          editedFields
        }
      });
      // Flash message
      appDispatch({
        type: ACTION.flashMessage,
        value: "Successfully edited user"
      });
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response.status === HTTP_CODES.unauthorised
      ) {
        appDispatch({
          type: ACTION.flashMessage,
          value: "Failed to edit user"
        });
        checkDispatch({ type: ACTION.toggle });
      } else {
        appDispatch({
          type: ACTION.flashMessage,
          value: "There was an error"
        });
      }
    }
    setIsEditing(false);
  }

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

      {/* ========== Email edit =========== */}
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
      <td
        style={{
          maxWidth: "100px",
          textAlign: "center"
        }}
      >
        <div style={{ width: "flex", gap: "30px" }}>
          {isEditing ? (
            <>
              <div>
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
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleCancel}
                  ref={button => button && button.blur()}
                >
                  Cancel
                </button>
              </div>
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

export default EditUser;