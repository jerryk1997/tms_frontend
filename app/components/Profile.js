import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

//Custom Modules
import Page from "./Page";
import UserStateContext from "./ProtectedRoute/UserStateContext";
import { ACTION, HTTP_CODES, USER_API } from "../config/constants";
import DispatchContext from "../DispatchContext";

function Profile() {
  const { userState, setUserState } = useContext(UserStateContext);
  const appDispatch = useContext(DispatchContext);

  const [email, setEmail] = useState(userState.email);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const navigate = useNavigate();

  function validatePassword() {
    // Define variables for each part of the regular expression
    const atLeastOneAlphabet = "(?=.+[A-Za-z])";
    const atLeastOneNumber = "(?=.+\\d)";
    const atLeastOneSpecial = "(?=.+[@$!%*?&.,;^_()=+\\-\\[\\]{}~:;'\"<>/|])";
    const allowedCharacters =
      "([A-Za-z\\d@$!%*?&.,;^_()=+\\-\\[\\]{}~:;'\"<>/|])";
    const minMaxLen = "{8,10}";

    // Construct the full regular expression using the defined parts
    const passwordPattern = new RegExp(
      `^${atLeastOneAlphabet}${atLeastOneNumber}${atLeastOneSpecial}${allowedCharacters}${minMaxLen}$`
    );

    if (!password || passwordPattern.test(password)) {
      setPasswordError("");
    } else {
      setPasswordError(
        "Password must be 8-10 characters and contain alphabets, numbers, and special characters."
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const body = {};
    if (email !== userState.email) {
      body.email = email;
    }

    if (password !== "") {
      body.password = password;
    }

    try {
      const response = await Axios.put(USER_API.currentUser, body, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(response);
      if (response.status === HTTP_CODES.success) {
        appDispatch({
          type: ACTION.flashMessage,
          value: "Successfully edited profile"
        });
        setPassword("");
        setUserState({ ...userState, email });
      }
    } catch (error) {
      appDispatch({
        type: ACTION.flashMessage,
        value: "Edit failed, please contact administrator"
      });
    }
  }

  let enableSubmitDebounce;
  useEffect(() => {
    enableSubmitDebounce = setTimeout(() => {
      const validNonEmptyPassword = password !== "" && passwordError === "";
      const emailChanged = email !== userState.email;
      setCanSubmit(
        validNonEmptyPassword || (emailChanged && passwordError === "")
      );
    }, 600); // Longer delay to allow passwordError to disable button

    return () => clearTimeout(enableSubmitDebounce);
  }, [userState, email, password, passwordError]);

  let validatePasswordDebounce;
  useEffect(() => {
    setCanSubmit(false);
    validatePasswordDebounce = setTimeout(() => {
      validatePassword();
    }, 500);

    return () => clearTimeout(validatePasswordDebounce);
  }, [password]);

  return (
    <Page title="Profile" wide={true}>
      {/* ====================== Page Header ====================== */}
      <header className="col-5 mx-auto mb-4">
        {" "}
        {/* Add a header element */}
        <h1>Your profile</h1>
        <p>View or type to edit</p>
      </header>
      {/* ========================= Form ========================== */}
      <form onSubmit={handleSubmit} className="col-5 mx-auto">
        {/* ==================== Username input ===================== */}
        <div className="form-group">
          <label htmlFor="username-change" className="text-muted mb-1">
            Username
          </label>
          <input
            id="username-change"
            name="username"
            className="form-control"
            type="text"
            autoComplete="off"
            defaultValue={userState.username}
            disabled
          />
        </div>

        <div className="form-group">
          <label htmlFor="email-change" className="text-muted mb-1">
            Email
          </label>
          <input
            onChange={e => setEmail(e.target.value)}
            id="email-change"
            name="email"
            className="form-control"
            placeholder="Email"
            value={email} // Set the input value to the email state
          />
        </div>

        {/* ==================== Password Input ===================== */}
        <div className="form-group">
          <label htmlFor="password-change" className="text-muted mb-1">
            Password
          </label>
          <input
            onChange={e => setPassword(e.target.value)}
            id="password-change"
            name="password"
            className="form-control"
            type="password"
            placeholder="New Password"
            value={password}
          />
        </div>

        {passwordError !== "" && (
          <small className="text-danger">{passwordError}</small>
        )}
        {}

        {/* ===================== Submit button ===================== */}
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-lg btn-success "
            disabled={!canSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </Page>
  );
}

export default Profile;
