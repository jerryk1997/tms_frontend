import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

// Custom modules
import { ACTION, ADMIN_API, HTTP_CODES } from "../../config/constants";

// Context
import DispatchContext from "../../DispatchContext";
import UserManagementStateContext from "./UserManagementStateContext";
import UserManagementDispatchContext from "./UserManagementDispatchContext";
import DispatchCheckContext from "../ProtectedRoute/DispatchCheckContext";
import PasswordChangeInput from "../PasswordChangeInput";

function CreateUser() {
  const navigate = useNavigate();
  // ======================= Context =======================
  const appDispatch = useContext(DispatchContext);
  const userMgmtState = useContext(UserManagementStateContext);
  const userMgmtDispatch = useContext(UserManagementDispatchContext);
  const checkDispatch = useContext(DispatchCheckContext);

  // ======================= Row state =======================
  const [groupOptions, setGroupOptions] = useState();

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [selectedGroupOptions, setSelectedGroups] = useState([]);

  const userStatusOptions = [
    { label: "Active", value: "active" },
    { label: "Disabled", value: "disabled" }
  ];
  const [selectedStatusOption, setSelectedStatus] = useState(
    userStatusOptions[0]
  );

  const [canSubmit, setCanSubmit] = useState(false);

  // ======================= Event Listeners =======================
  async function handleCreateUser() {
    const user = {};

    setUsername(username.trim());
    user.username = username;
    user.password = password;

    if (email) {
      user.email = email;
    }

    if (selectedGroupOptions.length > 0) {
      user.groups = selectedGroupOptions.map(option => option.value);
    }

    user.isActive = selectedStatusOption.value;

    try {
      await Axios.post(ADMIN_API.createUser, user, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      userMgmtDispatch({ type: ACTION.createUser, value: user });
      appDispatch({
        type: ACTION.flashMessage,
        value: "Successfully created user"
      });

      setUsername("");
      setEmail("");
      setPassword("");
      setSelectedGroups([]);
      setSelectedStatus(userStatusOptions[0]);
    } catch (error) {
      appDispatch({
        type: ACTION.flashMessage,
        value: "Failed to create user"
      });
      if (
        error instanceof AxiosError &&
        error.response.status === HTTP_CODES.unauthorised
      ) {
        checkDispatch({ type: ACTION.toggle });
      }
    }
  }

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
        { groupName: option.trim() },
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

  // ======================= Use effects =======================
  // Checks if they user can submit changes
  let enableSubmitDebounce;
  useEffect(() => {
    enableSubmitDebounce = setTimeout(() => {
      const validNonEmptyPassword = password !== "" && passwordError === "";
      const validNonEmptyUsername = username !== "" && usernameError === "";

      setCanSubmit(validNonEmptyUsername && validNonEmptyPassword);
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [username, usernameError, password, passwordError]);

  // Checks if they username is taken
  let usernameValidDebounce;
  useEffect(() => {
    setCanSubmit(false);
    async function checkUsername() {
      console.log("Checking create user username");
      try {
        setUsername(username.trim());
        console.log(username, ADMIN_API.user(username));
        const response = await Axios.get(ADMIN_API.user(username));
        console.log(response);
        setUsernameError("Username taken");
      } catch (error) {
        if (
          error instanceof AxiosError &&
          error.response.status === HTTP_CODES.notFound
        ) {
          console.log(`Username: <${username}> can be used`);
          setUsernameError("");
        } else {
          console.log(error);
        }
      }
      // }
    }

    usernameValidDebounce = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(usernameValidDebounce);
  }, [username]);

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

  return (
    <tr key={0}>
      <td style={{ maxWidth: "250px" }}>
        <input
          className="form-control"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username is required"
        />
        {usernameError && (
          <small className="text-danger">{usernameError}</small>
        )}
      </td>

      {/* ========== Email edit =========== */}
      <td>
        <input
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          className="form-control"
          placeholder="Password is required"
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
        />
      </td>

      {/* ========== Active / Disable =========== */}
      <td>
        <Select
          options={userStatusOptions}
          value={selectedStatusOption}
          onChange={handleStatusChange}
        ></Select>
      </td>

      {/* ========== Buttons =========== */}
      <td
        style={{
          textAlign: "center"
        }}
      >
        <button
          type="button"
          className="btn btn-success btn-sm"
          onClick={handleCreateUser}
          disabled={!canSubmit}
        >
          Create user
        </button>
      </td>
    </tr>
  );
}

export default CreateUser;
