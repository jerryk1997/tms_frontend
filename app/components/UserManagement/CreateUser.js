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

function CreateUser() {
  // ======================= Context =======================
  const appDispatch = useContext(DispatchContext);
  const userMgmtState = useContext(UserManagementStateContext);

  // ======================= Row state =======================
  const [groupOptions, setGroupOptions] = useState();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

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
  function handleCreateUser() {}
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

  // Checks if they user can submit changes
  let enableSubmitDebounce;
  useEffect(() => {
    enableSubmitDebounce = setTimeout(() => {
      const validNonEmptyPassword = password !== "" && passwordError === "";

      setCanSubmit(username && validNonEmptyPassword);
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [username, password, passwordError]);

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
      <td>
        <input
          className="form-control"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
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
          textAlign: "center",
          verticalAlign: "middle"
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
